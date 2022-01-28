import { FC, useCallback, useEffect, useMemo } from 'react'
import { createContext } from '@chakra-ui/react-utils'
import { useControllableState } from '@chakra-ui/react'
import { z } from 'zod'
import { get, set } from 'lodash'

export type Props<
    T = any,
    Z extends z.ZodRawShape = z.ZodRawShape
> = {
    schema: Z
    value?: Partial<T>
    onChange?: ( value : Partial<T>, path : string, val : any ) => any
}

export const useZodForm = function<T = any>( { schema, value = {}, onChange } : Props<T> ) {

    const [target, setTarget] = useControllableState( { defaultValue: value } )

    const setProp = useCallback( ( path : string, value : any ) => {
        const result = {...set( target, path, value )}
        if ( onChange )
            onChange( value, path, target )
        setTarget( result )
    }, [target, setTarget, onChange] )


    return {
        schema,
        value : target,
        setProp
    }
}

export const [ContextProvider, useContext] = createContext<ReturnType<typeof useZodForm>>()


export const ZodForm: FC<Props> = ( { children, value = {}, ...props } ) => {
    const ctx = useZodForm(props)
    return (
        <ContextProvider value={ctx} >
            {children}
        </ContextProvider>
    )
}

export const usePropSchema = ( field : string ) => {
    const { schema } = useContext()
    const prop : z.ZodFirstPartySchemaTypes = useMemo(() => get( schema, field ), [schema, field])
    return prop
}

export const useFieldValue = ( field : string ) => {
    const { value : val } = useContext()
    return useMemo(() => get( val, field ), [(val as any)[field], field])
}

export const useOnChange = ( field : string ) => {
    const { setProp } = useContext()
    return useCallback( (v: any) => v.target ? setProp( field, v.target.value ) : setProp( field, v ) , [setProp, field] )
}

export const useField = ( field : string ) => {
    const value = useFieldValue( field )
    const prop = usePropSchema( field )
    const onChange = useOnChange(field)
    return {
        field,
        value,
        prop,
        onChange
    }
}
