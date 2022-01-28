import type { Paginated, ServiceAddons, Params as FParams } from '@feathersjs/feathers'

import type { IncomingHttpHeaders  } from 'http'

export type Service<T> = ServiceMethods<T> & ServiceAddons<T>
export type InferServiceEntity<S> = S extends Service<infer T> ? T : never

type Operators = 
| '$in'
| '$nin'
| '$lt'
| '$lte'
| '$gt'
| '$gte'
| '$ne'
| '$or'
| '$sort'
| '$limit'
| '$skip'
| '$select'

export type Selection<T> = {
    '$select'?: Array<keyof T>
}
export type Limits = {
    '$limit'?: number
    '$skip'?:number
}
export type Ordering<T> = {
    '$sort'?:{
        [K in keyof T] ?: 1|-1
    } | 'random'
}
export type Filters<T> = {
    '$in' ?: any[],
    '$nin' ?: any[],
    '$lt' ?: number | string,
    '$lte' ?: number | string,
    '$gt' ?: number | string,
    '$gte' ?: number | string,
    '$ne' ?: any,
    '$or' ?: Query<T>
}

export type Equality<T> = {
    [K in keyof T]?: T[K] | Filters<T>
}
export type Query<T> = Filters<T> & Ordering<T> & Limits & Selection<T> & Equality<T>

export interface Params<T> extends Omit<FParams<T>, 'query' | 'provider' | 'headers'> {
    query ?: Query<T>
    provider ?: string
    headers ?: IncomingHttpHeaders
}

export interface ServiceMethods<
    T,
    P extends Partial<Params<T>> = Partial<Params<T>>,
> {

    get     (id: string | number, params?: Params<T>): Promise<T>

    find    (params?: P): Promise<T[] | Paginated<T>>

    remove  (id: NullableId, params?: P): Promise<T[] | T>
    patch   (id: NullableId, data: Partial<T>, params?: P): Promise<T[] | T>
    update  (id: NullableId , data: T, params?: P ) : Promise<T[] | T>

    create (
        data : Partial<T> | Partial<T>[],
        params?: P
    ) : Promise<T | T[]>
}

export type Hook<T> = (context: HookContext<T>) => (Promise<HookContext<T> | void> | HookContext<T> | void);

export interface HookMap<T> {
    all: Hook<T> | Hook<T>[];
    find: Hook<T> | Hook<T>[];
    get: Hook<T> | Hook<T>[];
    create: Hook<T> | Hook<T>[];
    update: Hook<T> | Hook<T>[];
    patch: Hook<T> | Hook<T>[];
    remove: Hook<T> | Hook<T>[];
}

export interface HooksObject<T> {
    before: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
    after: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
    error: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
    finally?: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
}

export interface Params<T> {
    query ?: Query<T>
    paginate ?: {
        max : number,
        default : number
    }
}

export interface HookContext<T> {
    params : Params<T>
}

export type InternalServiceMethods<T, SM extends ServiceMethods<T> = ServiceMethods<T>> = {
    [K in keyof SM as `_${string & K}`]: SM[K];
}

export type NullableId = string | number | null | undefined
