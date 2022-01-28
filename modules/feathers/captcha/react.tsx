/// <reference types="asas-virtuais/modules/types" />
import { BoxProps, Button, ButtonProps, Checkbox, HStack, Spinner, useBoolean } from '@chakra-ui/react'
import { makeHookContext } from 'asas-virtuais/modules/react/context'
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react'
import Worker from './worker?worker'
import Cookies from 'js-cookie'

const worker = new Worker()

export const useCaptcha = () => {
    const [working, setWorking] = useBoolean()
    const [probablyHuman, setProbablyHuman] = useBoolean()
    const [pow, setPow] = useState<string>()
    const workHard = useCallback( () => new Promise<string>( async (resolve, reject) => {
        const prefix = Cookies.get('captcha')
        console.log('Proof of work prefix:', prefix)
        worker.addEventListener( 'message', ( event ) => {
            const { type, data, from } = event.data
            if ( type === 'response' && from === 'work' ) {
                resolve( data )
            }
        })
        worker.postMessage({type: 'work', data: {prefix, difficulty: 20}})
        setTimeout( () => reject(), 20000 )
    } ), [Cookies.get] )
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

export const HumanCheckbox : FC<BoxProps> = ( { children, ...props } ) => {
    const {setProbablyHuman, probablyHuman, working } = useContext()
    const check = useCallback( (e : ChangeEvent<HTMLInputElement>) => {
        if ( e.target.checked )
            setProbablyHuman.on()
    }, [setProbablyHuman] )
    const checked = useMemo( () => probablyHuman === true, [probablyHuman] )
    return (
        <HStack spacing={4} {...props} justifyContent='center' >
            <Checkbox isChecked={checked ? true : false} required onChange={check}></Checkbox>
            <HStack>{children}</HStack>
            {working && <Spinner/>}
        </HStack>
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
