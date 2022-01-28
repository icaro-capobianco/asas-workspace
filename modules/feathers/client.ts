import {
	Id
} from '@feathersjs/feathers'
import { replaceAsync, safeReplaceAsync } from '../common'
import { FeathersRerturns, feathersResultToArray } from './util'
import { InferServiceEntity, Service } from './service'

export type WrappedService<
    S extends Service<any> = Service<any>,
    T extends InferServiceEntity<S> = InferServiceEntity<S>,
> = S & {
	cache: Record<string, T>
	get : S['get'] & {
		cached : (id: Id) => T | undefined,
		remote : Service<T>['get']
	}
}

export const wrapService = <
    S extends Service<any>,
	T extends InferServiceEntity<S> = InferServiceEntity<S>,
    W extends WrappedService<S> = WrappedService<S>
>(
	service: S,
	_id : keyof T = 'id' as keyof T
) : W => {
	let index: Record<string, T> = {}

	const include = <D extends FeathersRerturns<T>>(data: D) => {
		feathersResultToArray(data).forEach(obj => {
			index[obj[_id]] = obj
		})
		return data
	}
	const exclude = <D extends FeathersRerturns<T>>(data: D) => {
		feathersResultToArray(data).forEach(obj => {
			if (index[obj[_id]]) {
				delete index[obj[_id]]
			}
		})
		return data
	}

	const remote = service.get
	const cached = (id: Id) => index[id]
	const replacement = replaceAsync(
		service.get.bind(service),
		include,
		id => {
			const cached  = index[id]
			if (cached) {
				return cached
			}
			return undefined
		}
	)

	
	// @ts-expect-error
	replacement.remote = replaceAsync(
		remote.bind(service),
		include,
	)
	// @ts-expect-error
	replacement.cached = cached.bind(service)

	service.get = replacement
	service.find = safeReplaceAsync(service.find.bind(service), { effect : include })
	service.create = safeReplaceAsync(service.create.bind(service), { effect : include })
	service.update = safeReplaceAsync(service.update.bind(service), { effect : include })
	service.patch = safeReplaceAsync(service.patch.bind(service), { effect : include })
	service.remove = safeReplaceAsync(service.remove.bind(service), { effect : exclude })

	;(service as unknown as W).cache = index

	return service as W
}

export type UnwrapService<W> = W extends WrappedService<infer S> ? S : never
