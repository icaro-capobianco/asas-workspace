import { HookContext } from '@feathersjs/feathers'
import { hooks, Notifier } from 'feathers-authentication-management-ts'

export default {
    before: {
        create: {
            addVerification : hooks.addVerification()
        }
    },
    after: {
        create: {
            resendVerifySignup: ( notifier : Notifier ) => ( context : HookContext ) => (
                notifier('resendVerifySignup', context.result)
            ),
            removeVerification : hooks.removeVerification()
        } 
    }
}
