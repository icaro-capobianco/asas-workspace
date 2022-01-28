import type { Registration } from 'asas-virtuais/modules/opake/common'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useBoolean } from '@chakra-ui/react'

import * as OPAKE from 'asas-virtuais/modules/opake/client'
import { Create } from 'asas-virtuais/modules/feathers/react/methods'
import { makeHookContext } from 'asas-virtuais/modules/react/context'
import Login from '../login/context'
import Feathers from 'asas-virtuais/modules/feathers/react/feathers'

const proxy = () => Create.useMethod<any>({
    serviceName: ''
})

export type Props = {
    create : ReturnType<typeof proxy>
}

export const useRegister = ( {
    create,
} : Props ) => {

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
            create.setData({ auth, email })
        } catch (error) {
            console.error(error)
            console.log( 'Error details', {
                registration,
                email,
                password
            } )
            setError(error as Error)
        }
    }, [email, create.setData, create.params, create.data, password] )

    useEffect( () => {
        const auth = create.data?.auth
        if ( auth && ! create.resolved && ! create.loading ) {
            setLoading.on()
            create.call().finally(setLoading.off)
        }
    }, [create.call, create.data, create.params, create.data?.auth] )

    useEffect( () => {
        if ( create.resolved && ! login.loading ) {
            login.login()
        }
    }, [create.resolved] )

    useEffect( () => {
        if ( create.rejected ) {
            console.error(create.rejected)
            create.setData({auth: undefined})
        }
    }, [create.rejected] )

    const submitForm = useCallback( async (e : any) => {
        e.preventDefault()
        setLoading.on()
        if ( create.loading ) return
        if ( conflictPasswords ) return
        await register()
        setLoading.off()
        return false
    }, [create.call, create.loading, conflictPasswords] )

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
        submitForm,
        create
    }
}

export const { Provider, useContext } = makeHookContext( useRegister )

export default {
    Provider,
    useContext,
    useRegister,
}
