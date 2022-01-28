import { Box, Heading, VStack, Spinner, Text, useBoolean } from '@chakra-ui/react'
import Captcha from 'asas-virtuais/modules/feathers/captcha/react'
import Feathers from 'asas-virtuais/modules/feathers/react/feathers'
import Card from 'asas-virtuais/modules/react/components/card'
import { FC } from 'react'

export const InContext : FC<{
    title: string,
    button: string
}> = ({
    title= 'You need to verify your account, check your email inbox',
    button='Re-Send verification email'
}) => {

    const { feathers } = Feathers.useContext()

    const [loading, setLoading] = useBoolean()

    return (
        <Card as={VStack} maxW='45ch' w='100%'>
            <Heading>{title}</Heading>
            <Captcha.PoWButton
                leftIcon={loading ? <Spinner/> : undefined} onClick={ proof => {
                setLoading.on()
                feathers.service('authManagement').create({
                    action: 'resendVerifySignup',
                }, {
                    params: {
                        headers: {
                            authorization: proof
                        }
                    }
                }).finally( setLoading.off )
            } }>{button}</Captcha.PoWButton>
        </Card>
    )
}

const Verify : FC = ({children}) => {
    return (
        <Captcha.Provider>
            {children}
        </Captcha.Provider>
    )
}

export default Verify
