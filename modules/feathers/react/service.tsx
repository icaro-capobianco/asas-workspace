import type { Service } from 'asas-virtuais/modules/feathers/service'
import { useCallback, useMemo, useState } from 'react'
import { useBoolean } from '@chakra-ui/react'

import * as Feathers from './feathers'
import { WrappedService, wrapService } from '../client'
import { InferServiceEntity } from '../../feathers/service'
import { safeReplaceAsync } from '../../common'

import { makeHookContext } from '../../react/context'

export const useService = <
    S extends Service<any>,
    T extends InferServiceEntity<S> = InferServiceEntity<S>,
    W extends WrappedService<S> = WrappedService<S>,
>( name : string ) => {

    const { feathers } = Feathers.useContext()

    const service = useMemo(
        () => wrapService(feathers.service(name) as S),
        [feathers, name]
    )

	const [loading, setLoading] = useBoolean(false)

	const [index, setIndex] = useState<Record<string, T>>(service.cache)

	const array = useMemo(() => Object.values(index), [index])

	const sync = useCallback(
		function<R>(someData: R) {
			setIndex({ ...service.cache })
			return someData
		},
		[service.cache]
	)

	const wrappedService = useMemo(() => {
		const replaceMethod = <F extends (...p: any[]) => Promise<any>>( method : F ) : F => {
			return safeReplaceAsync( method, {
				effect : sync,
				early : setLoading.on,
				final : setLoading.off
			} )
		}
		service.find = replaceMethod( service.find.bind(service) )
		// @ts-expect-error
		service.get = replaceMethod( service.get.bind(service) )
		service.create = replaceMethod( service.create.bind(service) )
		service.update = replaceMethod( service.update.bind(service) )
		service.patch  = replaceMethod( service.patch.bind(service) )
		service.remove = replaceMethod( service.remove.bind(service) )
		return service
	}, [service, index, sync])

	return {
		service : wrappedService as W,
		array,
		index,
		loading,
		sync,
	}
}

export const createContext = <
	T,
	S extends Service<T> = Service<T>
>(
	name: string
) => {

	const { Provider, useContext } = makeHookContext( () => useService<S>(name), name )

	const useIndexed = ( id : string ) => {
		const { index } = useContext()
		return useMemo( () => index[id], [index[id], id] )
	}

	return {
		Provider,
		useContext,
		useIndexed,
	}
}
