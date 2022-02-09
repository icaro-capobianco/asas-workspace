import type { ServiceMethods, ServiceAddons, Application, HooksObject, HookMap, HookContext, Hook, Params } from '@feathersjs/feathers'
import type React from 'react'

module '@feathersjs/feathers' {

    export interface Application {
        configure (callback: (app: this) => void): this
    }


    export type NullableId = string | number | null | undefined

    export interface ServiceMethods<T, P extends Params<T> = Partial<Params<T>>> {
        find    <PP extends P>(params?: PP): Promise<T[] | Paginated<T>>
        remove  <ID extends NullableId>(id: ID, params?: P): Promise<ID extends null ? T[] : T>
        patch   <ID extends NullableId>(id: ID, data: Partial<T>, params?: P): Promise<ID extends null ? T[] : T>
        update  <
            ID extends NullableId,
            D extends T = T,
            PP extends P,
        >(
            id: ID,
            data: D,
            params?: PP
        ) : Promise<ID extends null ? T[] : T>

        create  <
            D extends Partial<T> | Partial<T>[],
            PP extends P,
        >(
            data: D,
            params?: PP
        ) : Promise<D extends Partial[] ? T[] : T>
    }

    // export interface ServiceAddons<T> extends Omit<ServiceAddons, 'hooks'> extends EventEmitter {
    //     hooks<D extends T = T>(hooks: Partial<HooksObject<T>>): this
    //     on(event: string, listener: ( data : T ) => any)
    //     once(event: string, listener: ( data : T ) => any)
    // }

    export interface Application {
        get <T>(name: string): T
        set (name: string, value: any): this;
    }

    export type Hook<T, S = Service<T>> = (context: HookContext<T, S>) => (Promise<HookContext<T, S> | void> | HookContext<T, S> | void);

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


    export type Query<T> = {
        [K in keyof T]?: T[K] | {
            '$in' ?: string | number
            '$nin' ?: string | number
            '$lt' ?: number
            '$lte' ?: number
            '$gt' ?: number
            '$gte' ?: number
            '$ne' ?: string | number
            '$or' ?: MyQuery<T>
        }
    } & {
        '$limit'?: number
        '$skip'?:number
        '$sort'?:{
            [K : keyof T] : 1|-1
        } | 'random'
        '$select'?: Array<K>
    }

    export interface Params<T> {
        query ?: Query<T>
    }

    export interface HookContext<T> {
        params : Params<T>
    }

}
module 'feathers-mailer' {
    import type SMTPTransport from 'nodemailer/lib/smtp-transport'
    import type {SendMailOptions, SentMessageInfo} from 'nodemailer'
    import type JSONTransport from 'nodemailer/lib/json-transport'
    import type SMTPPool from 'nodemailer/lib/smtp-pool'
    import type SESTransport from 'nodemailer/lib/ses-transport'
    import type StreamTransport from 'nodemailer/lib/stream-transport'
    import type SendmailTransport from 'nodemailer/lib/sendmail-transport'

    export class Service {
      constructor(transport?: SMTPTransport | SMTPTransport.Options | string, defaults?: SMTPTransport.Options)
      constructor(transport?: SMTPPool | SMTPPool.Options, defaults?: SMTPPool.Options)
      constructor(transport?: SendmailTransport | SendmailTransport.Options, defaults?: SendmailTransport.Options)
      constructor(transport?: StreamTransport | StreamTransport.Options, defaults?: StreamTransport.Options)
      constructor(transport?: JSONTransport | JSONTransport.Options, defaults?: JSONTransport.Options)
      constructor(transport?: SESTransport | SESTransport.Options, defaults?: SESTransport.Options)
  
      extend(obj: Record<string, unknown>): Record<string, unknown>
  
      create(body: SendMailOptions, params?: never): Promise<SentMessageInfo>
    }
  
    export default function init(transport?: SMTPTransport | SMTPTransport.Options | string, defaults?: SMTPTransport.Options): Service
    export default function init(transport?: SMTPPool | SMTPPool.Options, defaults?: SMTPPool.Options): Service
    export default function init(transport?: SendmailTransport | SendmailTransport.Options, defaults?: SendmailTransport.Options): Service
    export default function init(transport?: StreamTransport | StreamTransport.Options, defaults?: StreamTransport.Options): Service
    export default function init(transport?: JSONTransport | JSONTransport.Options, defaults?: JSONTransport.Options): Service
    export default function init(transport?: SESTransport | SESTransport.Options, defaults?: SESTransport.Options): Service
}
declare module '*?worker' {
    const workerConstructor: {
      new (): Worker
    }
    export default workerConstructor
}

declare module '*.svg' {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}
