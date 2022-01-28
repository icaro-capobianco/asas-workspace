// @ts-nocheck
// Initializes the `authmanagement` service on path `/authmanagement`
import { Application, HookContext } from '@feathersjs/feathers'
import authManagement from 'feathers-authentication-management-ts'
import notifier from 'asas-virtuais/modules/feathers/auth/notifier'
import { authenticate } from '@feathersjs/authentication'
import { getAuthenticatedUser } from 'asas-virtuais/modules/feathers/hooks'

export default (app : Application) => {

  app.configure(authManagement({
    app : app,
    service: 'user',
    notifier: notifier(app).notifier,
  }))

  app.service('authManagement').hooks({
    before: {
      create: [
        authenticate('jwt'),
        (context : HookContext) => {
          if ( ! context.params.provider )
            return context
          const user = getAuthenticatedUser(context)
          context.data.value = { email: user.email }
          return context
        }
      ]
    }
  })
}