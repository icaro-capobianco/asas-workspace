import type Stripe from 'stripe'
import { useCallback, useEffect, useMemo } from 'react'
import { Box, Button, Center, Heading, Spinner, useBoolean, VStack } from '@chakra-ui/react'
import { useStripe, PaymentElement, useElements } from '@stripe/react-stripe-js'
import { useAsyncState } from 'asas-virtuais/modules/react/hooks'

import { Retrieve } from 'asas-virtuais/modules/feathers/react/methods'
import { Provider } from 'asas-virtuais/modules/stripe/react/context'

export type Type = Stripe.PaymentIntent

export const RETRIEVE = Retrieve.createContext<Type>('payment-intent')

export const Load = ( { id, path } : { id: string, path : string } ) => {
    const { loading, resolved, rejected, call } = RETRIEVE.useMethod({id})

    useEffect( () => {
        call()
    }, [] )

    if ( loading ) {
        return <Spinner/>
    }
    if ( rejected ) {
        console.error(rejected) 
        return <>Failed to retrieve payment</>
    }
    if ( resolved ) {
        return <View {...resolved} />
    }
    return null
}

export const View = ( payment : Partial<Type> ) => {

    const stripe = useStripe()
    const elements = useElements()

    const { call, rejected, loading } = useAsyncState( useCallback( async () => {
        if ( ! stripe || ! elements ) {
            throw new Error('Stripe not ready')
        }
        const { paymentIntent, error } = await stripe.confirmPayment({
            elements,
            redirect : 'if_required',
            confirmParams : {
                payment_method_data : {
                    billing_details : {
                        address : {
                            country : 'BR'
                        }
                    }
                }
            }
        })
        if ( error ) {
            throw error
        }
        return paymentIntent
    }, [payment, elements, stripe] ) )

    const [ready, setReady] = useBoolean(false)

    const isPaid = useMemo( () => payment.status === 'succeeded', [payment.status] )

    
    const submit = useCallback( () => {
        call().then( () => {
            window.location.reload()
        } )
    }, [call] )

    if ( ! stripe || ! elements ) {
        return <Spinner/>
    }

    return (
        <Box w='100%'>
            <Box w='100%' >
                <VStack alignItems='stretch' minH='200px' >
                        <Heading my={0} size='md' >Informações de pagamento</Heading>
                    <Box w='100%'>
                        <b>Valor:</b> {((payment.amount || 0) / 100).toLocaleString('pt-BR', {
                            currency: 'BRL',
                            style: 'currency'
                        })}
                    </Box>
                    {isPaid ? (
                        <>Pagamento Recebido</>
                    ) : (
                        <>
                            {ready || <Center><Spinner size='lg' /></Center>}
                            {<>
                                <PaymentElement  onReady={setReady.on} id={payment.id} options={{
                                    fields: { billingDetails: { address : { country : 'never' } } }
                                }} />
                                <Box w='100%' >
                                    <Button disabled={loading} onClick={submit} mt={5} display='block' ml='auto' color='blue' >Pagar e Continuar</Button>
                                </Box>
                            </>}
                        </>
                    )}
                </VStack>

            </Box>
            {typeof rejected === 'string' ? (
                <Box>Houve um erro {rejected}</Box>
            ) : null}
        </Box>
    )
}


export const LoadPaymentWithProvider = ( {
    pk,
    id
} : {
    pk: string,
    id: string,
} ) => {

    const { loading, resolved, rejected, call } = RETRIEVE.useMethod({id})

    useEffect( () => {
        call()
    }, [] )

    if ( loading ) {
        return <Spinner/>
    }
    if ( rejected ) {
        console.error(rejected) 
        return <>Failed to retrieve payment</>
    }
    if ( resolved ) {
        return (
            <Provider pk={pk} clientSecret={resolved.client_secret as string} locale='pt-BR' >
                <View {...resolved} />
            </Provider>
        )
    }
    return null
}