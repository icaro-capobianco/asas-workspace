import type { Registration } from 'asas-virtuais/modules/opake/common'

import { useState, useMemo, useCallback } from 'react'
import { useBoolean } from '@chakra-ui/react'

import * as OPAKE from 'asas-virtuais/modules/opake/client'
import { makeHookContext } from 'asas-virtuais/modules/react/context'
import Login from '../login/context'
import Feathers from 'asas-virtuais/modules/feathers/react/feathers'
import * as Captcha from 'asas-virtuais/modules/feathers/captcha/react'

export type Props = {
    service: string
}

export const useRegister = ( { service } : Props ) => {

    const login = Login.useContext()

    const { feathers } = Feathers.useContext()

    const {
        email,
        setEmail,
        password,
        setPassword,
    } = login

    const [error, setError] = useState<Error>()
    const [loading, setLoading] = useBoolean()

    const [confirmPassword, setConfirmPassword] = useState<string | undefined>('')

    const conflictPasswords = useMemo(() => {
        return (confirmPassword?.length ?? 0) > 1 && confirmPassword !== password
    }, [confirmPassword, password])

    const { pow } = Captcha.useContext()

    const register = useCallback( async () => {
        const registration = OPAKE.registration()
        try {
            const start = registration.start( email, password )
            const res = (await feathers.rest.post(`/opake/register`, {
                email: start.username,
                clientR: start.clientR
            }, {
                withCredentials: true,
            })).data as Registration.StartResponse
            console.log( 'Finish registration', { serverRes: res })
            const auth = registration.finish( res )
            if ( ! auth ) {
                throw new Error('Error on registration')
            }
            await feathers.service(service).create({ auth, email }, {
                headers: {
                    'authorization': pow
                }
            })
            login.login()
        } catch (error) {
            console.error(error)
            console.log( 'Error details', {
                registration,
                email,
                password
            } )
            setError(error as Error)
        }
    }, [email, password, pow] )

    const submitForm = useCallback( async (e : any) => {
        e.preventDefault()
        setLoading.on()
        if ( conflictPasswords ) return
        await register()
        setLoading.off()
        return false
    }, [conflictPasswords, register, email, password, pow] )

    return {
        error,
        login,
        loading,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        conflictPasswords,
        submitForm
    }
}

export const { Provider, useContext } = makeHookContext( useRegister )

export default {
    Provider,
    useContext,
    useRegister,
}
