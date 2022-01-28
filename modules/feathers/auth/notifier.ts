import { Application } from '@feathersjs/feathers'
import { simpleURL } from 'asas-virtuais/modules/common'
import { NotifierOptions, User } from 'feathers-authentication-management-ts'
import { SendMailOptions } from 'nodemailer'

export type Email = SendMailOptions

const notifier = (app : Application) => {

    const origin = app.get('origin') as string
    const from = app.get('email') as string

    const getLink = (type: string, hash: string) => (
        `${simpleURL(origin, type).toString()}?token=${hash}`
    )

    function sendEmail(email : Email) {
      return app.service('mailer').create(email).then((result : unknown) => {
        console.log('Sent email', result)
      }).catch((err : unknown) => {
        console.log('Error sending email', err)
      })
    }
  
    return {
      notifier: (type: string, user: User, _notifierOptions?: NotifierOptions) => {
        const email : Partial<SendMailOptions> = {
            from,
            to: user.email,
        }
        switch (type) {
            case 'resendVerifySignup':
                email.subject = 'Verify Signup'
                email.html = getLink('verify', user.verifyToken as string)
            return sendEmail(email as Email)
            case 'verifySignup':
                email.subject = 'Confirm Signup'
                email.html = 'Thanks for verifying your email'
            return sendEmail(email as Email)
            case 'sendResetPwd':
            case 'resetPwd':
            case 'passwordChange':
            case 'identityChange':
            default:
                break
        }
      }
    }
  }

export default notifier