/// <reference types="@feathersjs/authentication-client" />
import type { AuthenticationResult } from '@feathersjs/authentication'
import { useNavigate } from 'react-router-dom'

import { useCallback, useEffect, useState } from 'react'
import { useBoolean } from '@chakra-ui/react'

import * as Feathers from 'asas-virtuais/modules/feathers/react/feathers'
import { makeHookContext } from 'asas-virtuais/modules/react/context'

export type Props = {
    onReAuth ?: ( result : AuthenticationResult ) => any
    onReAuthFailure ?: () => any
    onLogout ?: () => any
    routes?: {
        login?: {path: string, el: JSX.Element}
        register?: {path: string, el: JSX.Element}
        verify?: {path: string, el: JSX.Element}
    }
}

export const useAuth = ({
    onReAuth,
    onReAuthFailure,
    onLogout,
    routes
} : Props = {} ) => {

    if ( ! routes ) {
        routes = {
            login: {
                path: '/acess',
                el: <></>
            },
            register: {
                path: '/register',
                el: <></>
            },
            verify: {
                path: '/verify',
                el: <></>
            }
        }
    }

    const [loading, setLoading] = useBoolean(true)
    const { feathers } = Feathers.useContext()
    const [auth, setAuth] = useState<AuthenticationResult>()
    useEffect( () => {
        feathers.reAuthenticate()
        .then( result => {
            setAuth(result)
            if ( onReAuth )
                onReAuth(result)
        } )
        .catch( err => {
            feathers.authentication.handleError( err, 'authenticate' )
            feathers.authentication.reset()
            feathers.authentication.removeAccessToken()
            if ( onReAuthFailure )
                onReAuthFailure()
        } ).finally( () => {
            setLoading.off()
        }  )
    }, [] )

    const navigate = useNavigate()

    const logout = useCallback( () => {
        feathers.logout()
        setAuth(undefined)
        if ( onLogout ) {
            onLogout()
        } else {
            navigate(routes?.login?.path as string)
        }
    }, [auth, setAuth, feathers] )

    return {
        auth,
        setAuth,
        loading,
        logout,
        routes: routes as Required<typeof routes>
    }
}

export const { Provider, useContext } = makeHookContext(useAuth)

const Auth = {
    useAuth,
    useContext,
    Provider,
}

export default Auth
