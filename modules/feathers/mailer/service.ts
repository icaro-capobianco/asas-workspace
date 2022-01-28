import { Application } from '@feathersjs/express'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import Mailer from 'feathers-mailer'
import { disallow } from 'feathers-hooks-common'

export default ( { transport }: { transport: SMTPTransport} ) => (app : Application) => {
  app.use('/mailer', Mailer(transport))
  app.service('mailer').hooks( { before : { all : disallow('external') } } )
}