import type { Service as FService } from 'asas-virtuais/modules/feathers/service'

import { useAsyncState } from '../../react/hooks'
import * as Service from './service'
import { makeHookContext } from '../../react/context'
import { ComponentProps, FC, useMemo } from 'react'

export const createServiceContextHooks = <
	T,
	S extends FService<T> = FService<T>
>(
	name: string
) => {

	const useService = () => Service.useService<S>(name)
	const { Provider, useContext } = makeHookContext( useService )

	const useIndexed = ( id : string ) => {
		const { index } = useContext()
		return useMemo( () => index[id], [index[id], id] )
	}

	const makeMethodContext = <
		M extends ( ...p : any[] ) => any,
    >( useMethod : M ) => ({
		useMethod,
		...makeHookContext<M>( useMethod )
	})

	const makeMethodHook = <
		M extends S['get'] | S['find'] | S['create'] | S['update'] | S['patch'] | S['remove'],
		P extends Parameters<M> = Parameters<M>
	>( method : string ) => ( props ?: {params : P} ) => {
		const { service } = useContext()
		const fn = service[method] as M
		return useAsyncState<M>( fn, props?.params )
	}
	const RETRIEVE = makeMethodContext( makeMethodHook<S['get']>('get') )
	const FIND = makeMethodContext( makeMethodHook<S['find']>('find') )
	const CREATE = makeMethodContext( makeMethodHook<S['create']>('create') )
	const UPDATE = makeMethodContext( makeMethodHook<S['update']>('update') )
	const PATCH = makeMethodContext( makeMethodHook<S['patch']>('patch') )
	const REMOVE = makeMethodContext( makeMethodHook<S['remove']>('remove') )

	return {
		Provider,
		useContext,
		useIndexed,
		RETRIEVE,
		FIND,
		CREATE,
		UPDATE,
		PATCH,
		REMOVE
	}
}
