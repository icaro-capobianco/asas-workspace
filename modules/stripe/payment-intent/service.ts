import Stripe from 'stripe'
import { Application } from '@feathersjs/feathers'
import { PaymentIntent } from 'feathers-stripe-ts'

export default ( path : string, stripe : Stripe ) => ( app : Application ) => {
    const service = new PaymentIntent( stripe )
    app.use(path, service)
}