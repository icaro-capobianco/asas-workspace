import { useCallback } from 'react'
import * as Feathers from './feathers'
import { useControllableState } from '@chakra-ui/react'
import type { Params, Service } from 'asas-virtuais/modules/feathers/service'
import { useMemo } from 'react'
import { useAsyncState } from 'asas-virtuais/modules/react/hooks'
import { makeHookContext } from 'asas-virtuais/modules/react/context'
import { feathersResultToArray } from 'asas-virtuais/modules/feathers/util'


export function makeCreateHook<T>(serviceName : string) {
    type Props = {
        data ?: Partial<T>
        params ?: Partial<Params<T>>
    }
    const useMethod = ( props : Props = {} ) => {
        const { feathers } = Feathers.useContext()
        const service : Service<T> = useMemo( () => feathers.service(serviceName), [ feathers, serviceName ] )
        const [args, setArgs] = useControllableState<Props>( {
            defaultValue : {
                data : props.data ?? {},
                params : props.params ?? {}
            }
        } )
        const setData = useCallback( ( data : Partial<T> ) => {
            setArgs({
                ...args,
                data: {
                    ...args.data,
                    ...data
                },
            })
        }, [args, args.data, setArgs] )
        const setParams = useCallback( ( params : Partial<Params<T>> ) => {
            setArgs({
                ...args,
                params,
            })
        }, [args, setArgs] )
        const setPropValue = useCallback( ( key : keyof T, target : boolean, value : any ) => {
            setData( {
                [key] : target ? value.target.value : value
            } as unknown as Partial<T> )
        }, [setData, args.data] )
        const setProp = useCallback( <K extends keyof T>( key : K, target : boolean = false ) => {
            return setPropValue.bind( null, key, target )
        }, [setData, args.data, setPropValue] )
        const { call, resolved, rejected, loading } = useAsyncState( service.create.bind(service), [args.data, args.params] )
        return {
            data: args.data,
            params : args.params,
            setArgs,
            setProp,
            setData,
            setParams,
            setPropValue,
            call, resolved, rejected, loading
        }
    }
    const { Provider, useContext } = makeHookContext(useMethod)
    return {
        useMethod,
        Provider,
        useContext
    }
}

export function makeFindHook<T>(serviceName : string) {
    type Props = Partial<Params<T>>
    const useMethod = ( props : Props ) => {
        const { feathers } = Feathers.useContext()
        const service : Service<T> = useMemo( () => feathers.service(serviceName), [ feathers, serviceName ] )
        const [params, setParams] = useControllableState( {
            defaultValue : props
        } )
        const { call, resolved, rejected, loading } = useAsyncState( service.find, [params] )
        return {
            params,
            setParams,
            resolved,
            rejected,
            loading,
            call
        }
    }
    const { Provider, useContext } = makeHookContext(useMethod)
    return {
        useMethod,
        Provider,
        useContext
    }
}

export module Retrieve {
    export type Props = {
        serviceName: string
        id : string
    }
    export function useMethod <T, >( { serviceName, id } : Props ) {
        const { feathers } = Feathers.useContext()
        const service : Service<T> = useMemo( () => feathers.service(serviceName), [ feathers, serviceName ] )
        const { call, resolved, rejected, loading } = useAsyncState( service.get.bind(service), [id] )
        return {
            resolved,
            rejected,
            loading,
            call
        }
    }
    export function createContext<T, >( serviceName: string ) {
        return {
            useMethod: ( props: Omit<Props, 'serviceName'> ) => useMethod<T>( {...props, serviceName} ),
            ...(makeHookContext( ( props: Omit<Props, 'serviceName'> ) => useMethod<T>( {...props, serviceName} ) ))
        }
    }
}

export module Create {
    type Props<T> = {
        serviceName : string
        data ?: Partial<T>
        params ?: Partial<Params<T>>
    }
    export function useMethod<T, > ( {serviceName, ...props} : Props<T> ) {
        const { feathers } = Feathers.useContext()
        const service : Service<T> = useMemo( () => feathers.service(serviceName), [ feathers, serviceName ] )
        const [args, setArgs] = useControllableState<Omit<Props<T>, 'serviceName'>>( {
            value: props.data && props.params ? {
                data: props.data,
                params : props.params
            } : undefined,
            defaultValue : {
                data : props.data ?? {},
                params : props.params ?? {}
            }
        } )
        const setData = useCallback( ( data : Partial<T> ) => {
            setArgs({
                ...args,
                data: {
                    ...args.data,
                    ...data
                },
            })
        }, [args, args.data, setArgs] )
        const setParams = useCallback( ( params : Partial<Params<T>> ) => {
            setArgs({
                ...args,
                params,
            })
        }, [args, setArgs] )
        const setPropValue = useCallback( ( key : keyof T, target : boolean, value : any ) => {
            setData( {
                [key] : target ? value.target.value : value
            } as unknown as Partial<T> )
        }, [setData, args.data] )
        const setProp = useCallback( <K extends keyof T>( key : K, target : boolean = false ) => {
            return setPropValue.bind( null, key, target )
        }, [setData, args.data, setPropValue] )
        const { call, resolved, rejected, loading } = useAsyncState( service.create.bind(service), [args.data, args.params] )
        return {
            data: args.data,
            params : args.params,
            setArgs,
            setProp,
            setData,
            setParams,
            setPropValue,
            call, resolved, rejected, loading
        }
    }
    export function createContext<T, >( serviceName: string ) {
        return {
            useMethod: ( props: Omit<Props<T>, 'serviceName'> = {} ) => useMethod<T>( {...props, serviceName} ),
            ...(makeHookContext( ( props: Omit<Props<T>, 'serviceName'> ) => useMethod<T>( {...props, serviceName} ) ))
        }
    }
}

export module Find {
    type Props<T> = Partial<Params<T>> & { serviceName : string }
    export function useMethod<T, >( {serviceName, ...props} : Props<T> ) {
        const { feathers } = Feathers.useContext()
        const service : Service<T> = useMemo( () => feathers.service(serviceName), [ feathers, serviceName ] )

        const [params, setParams] = useControllableState( {
            defaultValue : props
        } )
        const { call, resolved, rejected, loading } = useAsyncState( service.find.bind(service), [params] )
        const array = useMemo( () => resolved ? feathersResultToArray(resolved) : [], [resolved] )
        return {
            params,
            setParams,
            resolved,
            rejected,
            loading,
            array,
            call
        }
    }
    export function createContext<T, >( serviceName : string ) {
        return {
            useMethod: ( props: Omit<Props<T>, 'serviceName'> = {} ) => useMethod<T>( {...props, serviceName} ),
            ...(makeHookContext( ( props: Omit<Props<T>, 'serviceName'> ) => useMethod<T>( { ...props, serviceName } ) ))
        }
    }
}

export module Patch {
    type Props<T> = {
        serviceName : string,
        id ?: string | null
        data ?: Partial<T>
        params ?: Partial<Params<T>>
    }
    export function useMethod<T, >( {
        serviceName,
        id,
        data,
        params
    } : Props<T> ) {
        const { feathers } = Feathers.useContext()
        const service : Service<T> = useMemo( () => feathers.service(serviceName), [ feathers, serviceName ] )
    
        type StateProps = Omit<Props<T>, 'serviceName'>
        const [args, setArgs] = useControllableState<StateProps>( {
            defaultValue : { id, data, params }
        } )
        const setId = useCallback( ( id : string ) => {
            return {
                id,
                ...args
            }
        }, [id, args] )
        const setData = useCallback( ( data : Partial<T> ) => {
            setArgs({
                ...args,
                data: {
                    ...args.data,
                    ...data
                },
            })
        }, [args, args.data, setArgs] )
        const setParams = useCallback( ( params : Partial<Params<T>> ) => {
            setArgs({
                ...args,
                params,
            })
        }, [args, setArgs] )
        const setPropValue = useCallback( ( key : keyof T, target : boolean, value : any ) => {
            setData( {
                [key] : target ? value.target.value : value
            } as unknown as Partial<T> )
        }, [setData, args.data] )
        const setProp = useCallback( <K extends keyof T>( key : K, target : boolean = false ) => {
            return setPropValue.bind( null, key, target )
        }, [setData, args.data, setPropValue] )
    
        const { call, resolved, rejected, loading } = useAsyncState( service.find, [params] )
        return {
            data: args.data,
            params : args.params,
            setArgs,
            setProp,
            setData,
            setId,
            setParams,
            setPropValue,
            call, resolved, rejected, loading
        }
    }
    export function createContext<T, >( serviceName : string ) {

        return {
            useMethod: ( props : Omit<Props<T>, 'serviceName'> ) => useMethod( { serviceName, ...props } ),
            ...(makeHookContext( ( props: Omit<Props<T>, 'serviceName'> ) => useMethod<T>( { serviceName, ...props} ) ))
        }
    }
}


export type HookProps<H> = H extends ( props : infer P ) => any ? P : never

