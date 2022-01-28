import { FC, useMemo } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

export type Props = StripeElementsOptions & {
    pk: string
}

export const Provider : FC<Props> = ( { children, ...options } ) => {

    const promise = useMemo( () => (
        loadStripe( options.pk, options )
    ), [options] )

    return (
        <Elements stripe={promise} options={options} >{children}</Elements>
    )

}
