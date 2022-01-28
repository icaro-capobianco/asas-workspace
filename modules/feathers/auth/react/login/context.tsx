import type { AuthenticationResult } from '@feathersjs/authentication'
import type { Login } from 'asas-virtuais/modules/opake/common'

import { useCallback, useEffect, useState } from 'react'
import { useBoolean } from '@chakra-ui/react'

import * as OPAKE from 'asas-virtuais/modules/opake/client'
import Auth from 'asas-virtuais/modules/feathers/auth/react/context'
import * as Feathers from 'asas-virtuais/modules/feathers/react/feathers'
import { makeHookContext } from 'asas-virtuais/modules/react/context'

export type Props = {
    onSuccess ?: ( result : AuthenticationResult ) => any
}

export const useLogin = ( { onSuccess } : Props ) => {
    const { setAuth, auth } = Auth.useContext()

    const { feathers } = Feathers.useContext()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [loading, setLoading] = useBoolean()
    const [error, setError] = useState<Error>()

    const login = useCallback( async () => {
        setLoading.on()
        try {
            const authentication = OPAKE.authentication()
            const start = authentication.start( email, password )
            const res = (await feathers.rest.post('/opake/authenticate', {
                email: start.username,
                clientR: start.clientR
            }, { withCredentials: true } )).data as Login.StartResponse
            const finish = authentication.finish( res )
            const auth = await feathers.authenticate( {
                strategy: 'opake',
                email,
                ...finish
            })
            setAuth(auth)
            return auth
        } catch (error) {
            console.error(error)
            setError(error as Error)
        }
        setLoading.off()
        return null
    }, [email, password, setAuth, setLoading] )

    const submitForm = useCallback( async (e : any) => {
        e.preventDefault()
        await login()
        return false
    }, [email, password, setAuth] )
    useEffect( () => {
        if ( onSuccess ) {
            if ( auth && auth.authentication.strategy === 'opake' ) {
                onSuccess( auth )
            }
        }
    }, [auth] )
    return {
        error,
        email,
        password,
        setEmail,
        setPassword,
        loading,
        login,
        submitForm,
    }

}

export const { Provider, useContext } = makeHookContext( useLogin )

export default {
    Provider,
    useContext,
    useLogin
}
