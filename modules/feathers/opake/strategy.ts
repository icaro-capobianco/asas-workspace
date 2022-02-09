import type { RequestHandler } from 'express'
// import type { AuthenticationRequest } from '@feathersjs/authentication'
import type { Application } from '@feathersjs/express'
import type { StoredData, Login, Registration } from 'asas-virtuais/modules/opake/common'
import type { Service, Params } from '../service'

import { authentication, registration, AuthenticationContext, RegistrationContext } from 'asas-virtuais/modules/opake/server'
import { LocalStrategy } from '@feathersjs/authentication-local'

import { NotAuthenticated } from '@feathersjs/errors'
import { feathersResultToArray } from '../util'
import { discard } from 'feathers-hooks-common'

type Options = {
    sk : string
    vk : string
}

type Session = {
    authData ?: StoredData
    authContext ?: AuthenticationContext
    registrationContext ?: RegistrationContext
}

type ARequest = {
    context : AuthenticationContext
    authData : StoredData
}

export class OPAKEStrategy extends LocalStrategy {

    sk : string
    vk : string

    name = 'opake'

    constructor( { sk, vk } : Options ) {
        super()
        this.sk = sk
        this.vk = vk
    }

    async authenticate (data: ARequest & {
        clientSignature : string
    }, params: Params<any>) {
        const { usernameField, entity, errorMessage, authDataField } = this.configuration
        const username = (data as any)[usernameField]

        const opake = (params as any).opake

        if ( ! username || ! opake ) {
            throw new NotAuthenticated(errorMessage)
        }

        const { authContext, authData } = opake

        if ( ! authContext || ! authData ) {
            throw new NotAuthenticated(errorMessage)
        }

        try {
            authentication( {
                serverSK: this.sk
            } )( authContext ).finish( data )
        } catch (error) {
            throw new NotAuthenticated(errorMessage)
        }
        delete params.provider
        const user = await this.findEntity( username, params )
        delete user[authDataField]

        return {
          authentication: { strategy: this.name },
          [entity]: user
        }
    }

    verifyConfiguration() {
        const {
            authDataField,
        } = this.configuration
        if ( ! authDataField )
            throw new Error('Missing opake configuration: authDataField')
    }
}

export const opakeSession = () => ( app : Application ) => {
    const config = app.get('authentication')
    const { service, errorMessage } = config

    app.post(`/${service}`, ((req : any, res, next) => {
        const { registrationContext } = req.session as Session

        if ( ! registrationContext ) {
            console.log('Session context error')
            res.status(401).send(errorMessage)
            return
        }
        req.feathers.registrationContext = registrationContext
        next()
    }) as RequestHandler)
}

export const setupOPAKE = ( {
    sk,
    vk,
} : Options ) => ( app : Application ) => {

    const config = app.get('authentication')
    const { service, errorMessage } = config
    const { authDataField, usernameField } = config.opake

    const register = registration({serverVK: vk})
    const authenticate = authentication({serverSK: sk})

    ;(app.service(service) as Service<any>).hooks({
        before : {
            create : (context) => {
                
                const { registrationContext } = context.params as Session

                try {
                    const auth = context.data[authDataField] as Registration.FinishPayload
                    if ( ! auth || ! auth.envelope ) {
                        throw new NotAuthenticated
                    }
                    context.data.auth = register(registrationContext).finish(auth)
                } catch (error) {
                    console.error(error)
                    throw new NotAuthenticated
                }

                return context
            },
        },
        after: {
            get : (context) => {
                if ( context.params.provider !== undefined ) {
                    discard('auth')(context as any)
                }
            }
        }
    })

    app.post('/authentication', ( async (req : any, res, next) => {
        
        if ( req.body?.strategy !== 'opake' ) {
            return next()
        }

        const { clientSignature } = req.body as Login.FinishPayload

        if ( ! clientSignature ) {
            console.log('Invalid signature')
            res.status(401).send(errorMessage)
            return
        }
        const { authData, authContext } = req.session as Session
        if ( ! authData || ! authContext ) {
            console.log('Invalid session')
            res.status(401).send(errorMessage)
            return
        }
        req.feathers.opake = {
            authData,
            authContext
        }
        const service = app.defaultAuthentication('/authentication')
        const [ strategy ] = service.getStrategies('opake') as [ OPAKEStrategy ]
        if ( ! strategy ) {
            console.log('Invalid strategy')
            res.status(401).send(errorMessage)
            return
        }
        next()
    }) as RequestHandler)

    app.post('/opake/register', ( async (req, res, next) => {

        const { clientR } = req.body as Partial<Registration.StartPayload>

        const username = req.body[usernameField]

        const error = new NotAuthenticated(errorMessage)

        if ( ! username || ! clientR ) {
            console.error( 'Invalid registration body' )
            res.status(error.code).send(error.message)
            return
        }

        const authData = feathersResultToArray(await (app.service(service) as Service<any>).find( {
            query : {
                $select : [authDataField],
                $limit : 1,
                [usernameField] : username
            }
        } ))?.[0]?.[authDataField] as StoredData

        if ( authData ) {
            console.error( 'User already exists' )
            res.status(error.code).send(error.message)
            return
        }

        try {
            const context = {}

            const response = register( context ).start( { username, clientR } )

            // @ts-expect-error
            req.session.registrationContext = context


            res.json( response )

        } catch (err) {
            console.error(err)
            res.status(error.code).send(error.message)
            return
        }

        next()
    }) as RequestHandler )
    app.post('/opake/authenticate', ( async (req, res, next) => {
        const { clientR } = req.body as Partial<Login.StartPayload>

        const username = req.body[usernameField]

        const error = new NotAuthenticated(errorMessage)

        if ( ! username || ! clientR ) {
            console.error('Invalid authentication')
            res.status( error.code ).send( error.message )
            next()
            return
        }
        const user = feathersResultToArray(await (app.service(service) as Service<any>).find( {
            query : {
                $select : [authDataField],
                $limit : 1,
                [usernameField] : username
            }
        } ))?.[0]
        

        if ( ! user ) {
            res.status( error.code ).send( error.message )
            next()
            return
        }

        const authData = user[authDataField] as StoredData

        if ( ! authData ) {
            console.error('Invalid user auth data')
            res.status( error.code ).send( error.message )
            next()
            return
        }

        const context = {}
        try {

            const response = authenticate( context ).start( { authData, clientR } )

            // @ts-expect-error
            req.session.authData = authData
            // @ts-expect-error
            req.session.authContext = context
            res.json( response )

        } catch (error) {
            console.log(error)
            res.sendStatus(403)
            next()
            return
        }

        next()
    }) as RequestHandler )

}
