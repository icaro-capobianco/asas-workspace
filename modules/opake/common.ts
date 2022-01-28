export type StoredData = {
    envelope : string
    clientVK : string
    OPRFVKey : string
    OPRFSKey : string
}

export type EnvelopeData = {
    serverVK: string
    clientSK: string
}

export module Registration {


    export type StartPayload = {
        username: string
        clientR: string
    }
    export type StartResponse = {
        serverVK: string
        serverR: string
    }
    export type FinishPayload = {
        envelope: string,
        clientVK: string
    }
    // This is saved and not returned to the client
    export type FinishResponse = StoredData
}

export module Login {
    export type StartPayload = {
        username: string
        clientR: string
    }
    export type ParsedPayload = {
        authData: StoredData
        clientR: string
    }
    export type StartResponse = {
        response : {
            envelope : string
            OPRFVKey : string
            serverR  : string
            OPRFSignature: string
        },
        signature : string
    }
    export type FinishPayload = {
        clientSignature : string
    }
}

