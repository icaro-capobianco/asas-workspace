import { Application, Service } from '@feathersjs/feathers'
import { feathersResultToArray } from './util'

export const stateAction = <T, K extends keyof T = keyof T>(
    _service: string,
    key : K & string,
    value : T[K] & string,
    cb : ( data: T ) => void
) => 
( app : Application ) => {
    const service = app.service( _service ) as Service<T>
    service.on('patched', (data) => {
        if ( data[key] === value ) {
            cb(data)
        }
    })
    service.find( {
        query : {
            [key] : value
        }
    } ).then( feathersResultToArray )
    // @ts-expect-error
    .then( res => res.forEach( cb ) )
}

export const stateEvent = <T, K extends keyof T = keyof T>(
    _service: string,
    key : K & string,
    value : T[K] & string,
    cb : ( data : T ) => void
) => (app : Application) => {
    const service = app.service(_service) as Service<T>
    service.on( value, cb )
    app.configure( stateAction<any>( _service, key, value, (record) => {
        service.emit(value, record)
    } ) )
}

export default stateAction
