/// <reference types="asas-virtuais/modules/types" />
import { Button, ButtonProps, Checkbox, CheckboxProps, Spinner, useBoolean } from '@chakra-ui/react'
import { makeHookContext } from 'asas-virtuais/modules/react/context'
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react'
import Worker from './worker?worker'
import Cookies from 'js-cookie'
import { useRest } from 'asas-virtuais/modules/feathers/react/feathers'

const worker = new Worker()

export const useCaptcha = () => {
    const [working, setWorking] = useBoolean()
    const [probablyHuman, setProbablyHuman] = useBoolean()
    const [pow, setPow] = useState<string>()
    const axios = useRest()
    const workHard = useCallback( () => new Promise<string>( async (resolve, reject) => {
        let prefix = Cookies.get('captcha')
        if ( ! prefix )
            prefix = (await axios.get('/captcha')).data
        console.log('Proof of work prefix:', prefix)
        worker.addEventListener( 'message', ( event ) => {
            const { type, data, from } = event.data
            if ( type === 'response' && from === 'work' ) {
                resolve( data )
            }
        })
        worker.postMessage({type: 'work', data: {prefix, difficulty: 20}})
        setTimeout( () => reject(), 20000 )
    } ), [axios] )
    useEffect( () => {
        if ( probablyHuman && ! pow && ! working ) {
            setWorking.on()
            workHard().then( (pow) => {
                setPow(pow)
            } )
            .catch( setProbablyHuman.off )
            .finally( setWorking.off )
        }
    }, [probablyHuman, setPow, pow, setWorking, working] )
    return {
        setProbablyHuman,
        probablyHuman,
        pow,
        working,
        setWorking,
        workHard,
    }
}

export const {Provider, useContext} = makeHookContext( useCaptcha )

export const HumanCheckbox : FC<CheckboxProps> = ( { children, ...props } ) => {
    const {setProbablyHuman, probablyHuman, working } = useContext()
    const check = useCallback( (e : ChangeEvent<HTMLInputElement>) => {
        if ( e.target.checked )
            setProbablyHuman.on()
    }, [setProbablyHuman] )
    const checked = useMemo( () => probablyHuman === true, [probablyHuman] )
    return (
        <>
            <Checkbox isChecked={checked ? true : false} required onChange={check} {...props} >
                {children}
            </Checkbox>
            {working && <Spinner/>}
        </>
    )
}

export const PoWButton : FC<
    Omit<ButtonProps, 'onClick'> & {
        onClick: (pow: string) => void
    }
> = ( { children, onClick, ...props } ) => {
    const { working, setWorking, workHard } = useContext()
    return (
        <Button
            onClick={() => {
                setWorking.on()
                workHard().then(onClick)
                .finally(setWorking.off)
            }}
            isDisabled={working}
            iconRight={<Spinner/>}
            {...props}
        >{children}</Button>
    )
}

export default {
    useCaptcha,
    useContext,
    Provider,
    HumanCheckbox,
    PoWButton
}
