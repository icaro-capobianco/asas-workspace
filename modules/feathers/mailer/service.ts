import { Application } from '@feathersjs/express'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import Mailer from 'feathers-mailer'
import * as hooks from 'feathers-hooks-common'

const { disallow } = hooks

export default ( { transport }: { transport: SMTPTransport} ) => (app : Application) => {
  app.use('/mailer', Mailer(transport))
  app.service('mailer').hooks( { before : { all : disallow('external') } } )
}