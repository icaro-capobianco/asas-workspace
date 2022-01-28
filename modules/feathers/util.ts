import { Paginated } from '@feathersjs/feathers'

export const isPaginated = <T>(
	data: T | T[] | Paginated<T>
): data is Paginated<T> => (data as Paginated<T>).data !== undefined

export type FeathersRerturns<T> = T | T[] | Paginated<T>
export type FeathersRetuurnsEntity<F> = F extends FeathersRerturns<infer T> ? T : never

export const feathersResultToArray = <D extends FeathersRerturns<any>, T extends FeathersRetuurnsEntity<D>>( data : D ) : T[] => {
	return Array.isArray(data) ? data : isPaginated(data) ? data.data as T[] : [data as T]
}
