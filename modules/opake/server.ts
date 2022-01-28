import * as Common from './common'
import * as Crypto from './crypto'


export type RegistrationContext = {
    username ?: string
    OPRFVKey ?: string
    OPRFSKey ?: string
}

// Registration config: server's public key
export const registration = ( {
    serverVK,
} : {
    serverVK : string
} ) => ( context : RegistrationContext = {} ) => {

    /**
     * Registration step 2
     *  - server receives client's OPRF result
     *  - validates client's OPRF result
     *  - generates OPRF key pair
     */
    const start = ( {
        username,
        clientR
    } : Common.Registration.StartPayload ) : Common.Registration.StartResponse => {

        Crypto.OPRF.validateResult(clientR)

        context.username = username

        const { vk, sk } = Crypto.PPK.generateKeyPair()

        context.OPRFVKey = vk
        context.OPRFSKey = sk

        const serverR = Crypto.OPRF.server( clientR, sk )

        return {
          serverVK,
          serverR,
        }

    }

    const finish = ( {
        envelope,
        clientVK
    } : Common.Registration.FinishPayload ) : Common.Registration.FinishResponse => {

        const { OPRFVKey, OPRFSKey } = context 

        if ( ! OPRFVKey || ! OPRFSKey ) {
            throw new Error('Invalid registration context')
        }

        return {
            envelope,
            clientVK,
            OPRFVKey,
            OPRFSKey
        }
    }
    return {
        start,
        finish
    }
}

export type AuthenticationContext = {
    serverR ?: string
    clientVK ?: string
}
export const authentication = ( {
    serverSK,
} : {
    serverSK : string
} ) => ( context : AuthenticationContext = {} ) => {
    const start = ( {
        authData,
        clientR
    } : Common.Login.ParsedPayload ) : Common.Login.StartResponse => {

        // Validate Client's result
        Crypto.OPRF.validateResult(clientR)

        // Retrieve user auth data
        context.clientVK = authData.clientVK

        // Get server's OPRF result
        const serverR = Crypto.OPRF.server( clientR, authData.OPRFSKey )
        context.serverR = serverR

        // Sign the (now validated) client's OPRF result
        const OPRFSignature = Crypto.PPK.sign( authData.OPRFSKey, clientR )

        // Prepare response
        const response = {
            envelope : authData.envelope,
            OPRFVKey : authData.OPRFVKey,
            serverR,
            OPRFSignature,
        }

        // Sign Response
        const signature = Crypto.PPK.sign( serverSK, response )
        return {
            response,
            signature
        }
    }

    const finish = ( { clientSignature } : Common.Login.FinishPayload ) => {

        const { serverR, clientVK } = context

        if ( ! serverR || ! clientVK ) {
            throw new Error('Invalid login context')
        }

        Crypto.PPK.validateSignature( serverR, clientVK, clientSignature )
    }

    return { start, finish }
}
