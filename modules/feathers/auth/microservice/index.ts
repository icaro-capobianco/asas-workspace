import type { Application } from '@feathersjs/express'

import fs from 'fs'

import * as Authentication from '@feathersjs/authentication'

const { AuthenticationService, JWTStrategy } = Authentication

import microservice from 'asas-virtuais/modules/feathers/microservice'
import { OPAKEStrategy, setupOPAKE } from 'asas-virtuais/modules/feathers/opake/strategy'

export default async () => microservice( async ( app : Application ) => {

    const sk = fs.readFileSync('config/sk.pem', 'utf-8')
	const vk = fs.readFileSync('config/vk.pem', 'utf-8')

    if ( ! sk || ! vk ) {
        throw new Error('Missing sk.pem or vk.pem')
    }

	const auth = new AuthenticationService(app as any)
	auth.register('jwt', new JWTStrategy())
	auth.register('opake', new OPAKEStrategy({ sk, vk }))

	app.use('/authentication', auth as any)

	app.configure(setupOPAKE({sk, vk}) as any)

    return app
}, {
    use: ['mailer', 'user']
} )
