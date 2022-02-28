import type { Service } from '@feathersjs/feathers'
import type { Params, ServiceMethods, NullableId } from 'asas-virtuais/modules/feathers/service'
import * as Errors from '@feathersjs/errors'
import * as hooks from 'feathers-hooks-common'
import { feathersResultToArray } from '../util'

const { iff, disallow } = hooks
const { GeneralError, Timeout } = Errors

export type CreateEvent<T> = {
    type : 'create'
    data : Partial<T> | Partial<T>[]
    result ?: T | T[]
    params ?: Partial<Params<T>>
}
export type UpdateEvent<T> = {
    type : 'update'
    data : T
    result ?: T | T[]
    params ?: Partial<Params<T>>
    target ?: NullableId
}
export type PatchEvent<T> = {
    type : 'patch'
    data : Partial<T>
    result ?: T | T[]
    params ?: Partial<Params<T>>
    target ?: NullableId
}
export type RemoveEvent<T> = {
    type : 'remove'
    result ?: T | T[]
    params ?: Partial<Params<T>>
    target ?: NullableId
}

export type SourceEvent<T> = (CreateEvent<T> | UpdateEvent<T> | PatchEvent<T> | RemoveEvent<T>) & {
    id : string
    order : number
    resourceName: string
    createdAt : string
    resultAt ?: string
    errorAt ?: string
    error ?: string
    canceled ?: boolean
    process ?: string
    processed ?: boolean
    inQueue ?: boolean
    affected ?: string[]
}

let eventsSet = new Set()
let processEvent : number = 1

export type EventSourceService = Service<SourceEvent<any>>

export const setupEvents = async ( eventsService : EventSourceService ) => {

    const lastEvent = feathersResultToArray ( await eventsService.find( {
        query : {
            $limit : 1,
            $sort : {
                order : -1
            }
        }
    } ) )[0]
    if ( lastEvent ) {
        for( let i = 1; i <= lastEvent.order; i++ ) {
            eventsSet.add(i)
        }
    }
    console.log( `Initialized with ${eventsSet.size} events` )
    
    const lastProcessedEvent = feathersResultToArray ( await eventsService.find( {
        query : {
            $limit : 1,
            $sort : {
                order : -1
            },
            processed: true
        }
    } ) )[0]
    if ( lastProcessedEvent ) {
        console.log('Last processed event is: ', lastProcessedEvent.order)
        processEvent = lastProcessedEvent.order + 1
        console.log('Next expected event to process should be: ', processEvent)
    }

    eventsService.hooks({
        before: {
            create: ( context ) => {
                const event = context.data as SourceEvent<any>
                event.inQueue = true
                event.order = newEventOrder()
                return context
            }
        }
    })
}

let newEventOrder = () => {
    let i = eventsSet.size + 1
    eventsSet.add(i)
    return i
}

let shouldProcessEvent = ( event : SourceEvent<any> ) => {
    if ( event.order === processEvent ) {
        processEvent++
        return true
    }
    console.log(`Waiting for event ${processEvent} to be processed to process ${event.order}`)
    return false
}

const service = <T>( { eventService, resourceService, id = 'id' } : {
    eventService : EventSourceService
    resourceService : ServiceMethods<T> & { id : string }
    rebuild ?: boolean
    timeout ?: number
    id ?: string
} ) => {

    let process : string = 'original'
    let _resourceName : string

    let setup = async ( app : any, resourceName : string ) => {

        _resourceName = resourceName

        console.log( 'Resource Name: ', resourceName )

        const $this : any = this
        if ( $this !== undefined ) {
            if ( $this.super ) {
                $this.super( resourceName, app )
            }
        }

        const queuedEvents = feathersResultToArray( await eventService.find( {
            query: {
                $sort: {
                    order: -1
                },
                inQueue: true,
                resourceName
            }
        } ) )
        console.log( `${queuedEvents.length} events to process on: ${resourceName}` )
        for ( const event of queuedEvents.reverse() ) {
            await processEvent(event)
        }
    }

    let permissionToProcessEvent = ( event : SourceEvent<T> ) => {
        return new Promise( async (resolve, _reject) => {
            if ( shouldProcessEvent( event ) ) {
                resolve(event)
            } else {
                eventService.on('patched', ( e ) => {
                    if ( e.processed ) {
                        if ( shouldProcessEvent( event ) ) {
                            resolve(event)
                        }
                    }
                })
            }
        } )
    }

    let processEvent = async <E extends SourceEvent<T>>( event : E ) => {
        console.log( `Processing event ${event.order}`, `Event context\nResource name: ${event.resourceName}\nMethod:${event.type}` )

        console.log( `Awaiting permission for event ${event.order}` )
        await permissionToProcessEvent( event )
        console.log( `Permission granted for event ${event.order}` )
        let result : any
        let error : any

        try {
            result = await handleEvent( event )
        } catch (error) {
            console.error( 'Error handling event', error )
            await eventService.patch( event.id, {
                error : JSON.stringify(error),
                errorAt : (new Date()).toISOString(),
                processed : true,
                inQueue: false,
                process,
            } )
        }
        if ( result && ! error ) {

            const affected = (Array.isArray( result ) ? result : [ result ]).map( (
                a => (a as any)[ ( resourceService.id ?? 'id' ) ]
            ) )
            console.log('Removing event from the queue')
            await eventService.patch( event.id, {
                result : result,
                resultAt : (new Date()).toISOString(),
                processed : true,
                inQueue: false,
                process,
                affected
            } )
            return result
        }
        throw new GeneralError
    }

    let handleEvent = async<E extends SourceEvent<T>>( event : E ) => {
        const params = event.params
        switch( event.type ) {
            case 'create':
                return resourceService.create( event.data, params )
            case 'patch':
                return resourceService.patch( event?.target ?? null, event.data, params )
            case 'update':
                return resourceService.update( event?.target ?? null, event.data, params )
            case 'remove':
                return resourceService.remove( event?.target ?? null, params )
            default :
                return defaultHandle( event )
        }
    }

    const defaultHandle = ( _event : SourceEvent<T> ) => {
        throw new Error('Not implemented')
    }

    const methods : ServiceMethods<T> = {
        async create( data, params ) {
            const event = await eventService.create({
                type: 'create',
                data,
                params: {...params, eventSourced: true},
                createdAt: (new Date()).toISOString(),
                resourceName: _resourceName
            } as const)
            try {
                return await processEvent(event as SourceEvent<T>)
            } catch (error) {
                if ( error instanceof Timeout ) {
                    throw error
                } else {
                    throw error
                }
            }
        },
        async patch( id, data, params ) {
            const event = await eventService.create({
                type: 'patch',
                target: id,
                data,
                params: {...params, eventSourced: true},
                createdAt: (new Date()).toISOString(),
                resourceName: _resourceName
            } as const)
            try {
                return await processEvent(event as SourceEvent<T>)
            } catch (error) {
                if ( error instanceof Timeout ) {
                    throw error
                } else {
                    throw error
                }
            }
        },
        async update( id, data, params ) {
            const event = await eventService.create({
                type: 'update',
                target: id,
                data,
                params: {...params, eventSourced: true},
                createdAt: (new Date()).toISOString(),
                resourceName: _resourceName
            } as const)
            try {
                return await processEvent(event as SourceEvent<T>)
            } catch (error) {
                if ( error instanceof Timeout ) {
                    throw error
                } else {
                    throw error
                }
            }
        },
        async remove( id, params ) {
            const event = await eventService.create({
                type: 'remove',
                target: id,
                params: {...params, eventSourced: true},
                createdAt: (new Date()).toISOString(),
                resourceName: _resourceName
            } as const)
            try {
                return await processEvent(event as SourceEvent<T>)
            } catch (error) {
                if ( error instanceof Timeout ) {
                    throw error
                } else {
                    throw error
                }
            }
        },
        get( id, params = {} ) {
            return resourceService.get( id, {...params, eventSourced: true} )
        },
        find( params ) {
            return resourceService.find( {...params, eventSourced: true} )
        }
    }

    return {
        ...methods,
        defaultHandle,
        handleEvent,
        processEvent,
        permissionToProcessEvent,
        setup,
        process,
        id
    }

}

export const disallowHook = () => iff(context => !context?.params?.eventSourced, disallow())

export default service
