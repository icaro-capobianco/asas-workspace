import { useCallback, useState, useMemo, useEffect } from 'react'
import { useBoolean, useControllableState } from '@chakra-ui/react'
import { AxiosInstance } from 'axios'

type AxiosRequest = AxiosInstance['request']


/** Don't forget to bind fn when using this with class methods and such */
export const useAsyncState = <
	F extends (...any : any[]) => Promise<any>
>( fn : F, p : Partial<Parameters<F>> = [] as unknown as Partial<Parameters<F>> ) => {

	type P = Parameters<F>
	type R = ReturnType<F>
	type A = Awaited<R>

	const [loading, setLoading] = useBoolean()

	const [resolved, setResolved] = useState<A | undefined>()

	const [rejected, setRejected] = useState<any | undefined>()

	const [params, setParams] = useControllableState<Partial<P>>({
		value : p,
		defaultValue : p
	})

	const setParam = useCallback( <N extends number, PN extends P[N]>( n : N, value : PN ) => {
		params[n] = value
		setParams(params)
	}, [params, setParams] )

	const call = useCallback( () => {
		setLoading.on()
		// Pretend really hard https://youtu.be/JTEfpNtEoSA?t=565
		return fn( ...(params as P) )
			.then( res => {
				setResolved(res)
				return res
			} )
			.catch( err => {
				console.error(err)
				setRejected(err)
				return err
			} )
			.finally( setLoading.off )
	}, [params, fn] )

	return {
		params,
		setParam,
		setParams,
		call,
		loading,
		resolved,
		rejected,
	}
}
export const useFetch = ( ...p : Parameters<typeof fetch> ) => {
	return useAsyncState( fetch, p )
}
export const useAxiosRequest = ( axios : AxiosInstance, ...p : Parameters<AxiosRequest> ) => {
	return useAsyncState( axios.request, p )
}

export const useArray = <T>(initial: T[]) => {
	const [value, _set] = useState<{ array: T[] }>(() => ({ array: initial }))
	const res = useMemo( () => {
		const set = ( data: T[] ) => _set( { array : data } )
		const setAt = ( index: number, data: T ) => {
			const array = [...value.array]
			array[index] = data
			set( array )
		}
		const push = (data: T) => set([...value.array, data])
		const concat = (data: T[]) => set([...value.array, ...data])
		const remove = (data: T) => set(value.array.filter(e => e !== data))

		return {
			set,
			push,
			setAt,
			concat,
			remove,
			array : value.array
		}
	}, [value.array] )
	return res
}
export const useSingleIndex = <T, R = Record<string, T>>(initial: R = {} as R) => {
	const [index, set] = useState<R>(() => initial)
	const add = useCallback(
		(id : string, data: T) => set({
			...index,
			[id] : data
		}),
		[index],
	)
	const remove = useCallback(
		(id: keyof R) => {
			if (index[id]) {
				delete index[id]
				set({ ...index })
			}
		},
		[index]
	)

	return {
		set,
		add,
		remove,
		index,
	}
}
