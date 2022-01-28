import * as Common from './common'
import * as Crypto from './crypto'

// Config: service name, or app name, or server name. A name for the service or group of services that will authenticate the user
export type RegistrationContext = {
    password ?: string
    clientR ?: string
    mask ?: Uint8Array
}
export const registration = ( context : RegistrationContext = {} ) => {

    /** Registration, step 1: client calculates OPRF result with his password */
    const start = ( username : string, password : string ) : Common.Registration.StartPayload => {
        context.password = password
        const clientR = Crypto.OPRF.client(password)
        context.clientR = clientR.str
        context.mask = clientR.mask
        return { username, clientR : clientR.str }
    }


    /** Registration, step 3: Client validates server's response and build the envelope */
    const finish = ( {
        serverVK,
        serverR,
    } : Common.Registration.StartResponse ) : Common.Registration.FinishPayload => {

        // Generates client key pair
        const client = Crypto.PPK.generateKeyPair()

        // Validate Server's result
        Crypto.OPRF.validateResult(serverR)

        const { password, mask } = context

        console.log( 'DEBUG OPRF context:', context )

        if ( ! password || ! mask ) {
            throw new Error('Invalid login context')
        }

        // Completes OPRF
        const rwd = Crypto.OPRF.solveOPRF(mask, serverR)
        console.log( 'DEBUG OPRF', { mask, serverR, rwd } )
        
        // Encrypts the envelope
        const envelope = Crypto.envelope( rwd, ({
            serverVK,
            clientSK: client.sk,
        }))

        return {
            envelope,
            clientVK: client.vk,
        }

    }

    return {
        start,
        finish
    }
}


export type AuthenticationContext = {
    password ?: string
    clientR ?: string
    mask ?: Uint8Array
}
export const authentication = ( context : AuthenticationContext = {} ) => {

    const start = ( username : string, password : string ) : Common.Login.StartPayload => {
        context.password = password
        const clientR = Crypto.OPRF.client(password)
        context.clientR = clientR.str
        context.mask = clientR.mask
        return { username, clientR: clientR.str }
    }

    const finish = ( {
        response,
        signature,
    } : Common.Login.StartResponse ) : Common.Login.FinishPayload => {
        const {
            envelope,
            OPRFVKey,
            serverR,
            OPRFSignature,
        } = response

        const { password, mask, clientR } = context

        if ( ! password || ! clientR || ! mask ) {
            throw new Error('Invalid login context')
        }

        const rwd = Crypto.OPRF.solveOPRF(mask, serverR)
        Crypto.PPK.validateSignature( clientR, OPRFVKey, OPRFSignature )
        const { serverVK, clientSK } = Crypto.openEnvelope( rwd, envelope )
        Crypto.PPK.validateSignature( response, serverVK, signature )
        const clientSignature = Crypto.PPK.sign( clientSK, serverR )
        return { clientSignature }
    }
    return {
        start,
        finish
    }
}
