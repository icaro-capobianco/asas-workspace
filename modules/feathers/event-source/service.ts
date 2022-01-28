import { Service as FService, Params, ServiceMethods, NullableId } from 'asas-virtuais/modules/feathers/service'
import { feathersResultToArray } from '../util'
import { Timeout } from 'asas-virtuais/node_modules/@feathersjs/errors'
import { iff, disallow } from 'feathers-hooks-common'

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
    type :'patch'
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

export const setupEvents = async ( eventsService : FService<SourceEvent<any>> ) => {

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
    let res = event.order === processEvent
    processEvent++
    return res
}

const service = <T>( { eventService, resourceService, id = 'id' } : {
    eventService : FService<SourceEvent<T>>
    resourceService : ServiceMethods<T> & { id : string }
    rebuild ?: boolean
    timeout ?: number
    id ?: string
} ) => {

    let process : string = 'original'

    let setup = async ( app : any, resourceName : string ) => {

        const $this : any = this
        if ( $this !== undefined ) {
            if ( $this.super ) {
                $this.super( resourceName, app )
            }
        }

        eventService.hooks({
            before: {
                create: ( context ) => {
                    const event = context.data as SourceEvent<any>
                    if ( context.path ) {
                        event.resourceName = context.path
                    }
                    return context
                }
            }
        })

        const queuedEvents = feathersResultToArray( await eventService.find( {
            query : {
                $sort : {
                    order : -1
                },
                inQueue : true,
                resourceName
            }
        } ) )
        console.log( `${queuedEvents.length} events to process on: ${resourceName}` )
        for ( const event of queuedEvents ) {
            await processEvent(event)
        }
    }

    let permissionToProcessEvent = ( event : SourceEvent<T> ) => {
        return new Promise( async (resolve, _reject) => {
            if ( shouldProcessEvent( event ) ) {
                resolve(event)
            } else {
                eventService.on('patched', ( e ) => {
                    if ( e.processed && event.order === e.order + 1 ) {
                        resolve(event)
                    }
                })
            }
        } )
    }

    let processEvent = async <E extends SourceEvent<T>>( event : E ) => {
        console.log( `Processing event ${event.order}` )

        console.log( 'Awaiting permission' )
        await permissionToProcessEvent( event )
        console.log( 'Permission granted' )

        try {
            const result = await handleEvent( event )
            const affected = (Array.isArray( result ) ? result : [ result ]).map( (
                a => (a as any)[ ( resourceService.id ?? 'id' ) ]
            ) )
            await eventService.patch( event.id, {
                result : result,
                resultAt : (new Date()).toISOString(),
                processed : true,
                inQueue: false,
                process,
                affected
            } )
            return result
        } catch (error) {
            eventService.patch( event.id, {
                error : JSON.stringify(error),
                errorAt : (new Date()).toISOString(),
                processed : true,
                inQueue: false,
                process,
            } )
            throw error
        }
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