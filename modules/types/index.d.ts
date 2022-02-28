import type { ServiceMethods, ServiceAddons, Application, HooksObject, HookMap, HookContext, Hook, Params } from '@feathersjs/feathers'
import type React from 'react'

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
