import { FC } from 'react'
import { Link } from 'react-router-dom'
import { Input, Button, FormControl, FormLabel, Heading, VStack, Alert, AlertIcon } from '@chakra-ui/react'

import Card from 'asas-virtuais/modules/react/components/card'
import Auth from 'asas-virtuais/modules/feathers/auth/react/context'

import Context, { Props } from './context'

export const Provider : FC<Props> = ( { children, ...props } ) => {
    return (
        <Context.Provider {...props} >
            {children}
        </Context.Provider>
    )
}

export const Email : FC<{ label?: string }> = ({ label = 'Email' }) => {

    const {
        email,
        setEmail,
    } = Context.useContext()

    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <Input required type='text' value={email} onChange={e => setEmail(e.target.value)} />
        </FormControl>
    )
}

export const Password : FC<{label?: string}> = ({label = 'Password'}) => {

    const {
        password,
        setPassword,
    } = Context.useContext()

    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <Input min={6} required type='password' value={password} onChange={e => setPassword(e.target.value)} />
        </FormControl>
    )
}

export const LoginButton : FC = ( { children = 'Access account' } ) => {

    const {
        loading,
    } = Context.useContext()

    return (
        <Button disabled={loading} type='submit' >{children}</Button>
    )
}

export const ToRegister : FC = ( { children = "Register a new account" } ) => {
    const { routes } = Auth.useContext()
    return <Button as={Link} to={ routes.register.path } >{children}</Button>
}

export const LoginError : FC = ( { children = 'Falha no login' } ) => {
    const { error } = Context.useContext()
    return <>{error && <Alert status='error'><AlertIcon/>{children}</Alert>}</>
}

export const BasicLogin : FC<{header: string}> = ( { header = 'Access Account' } ) => {

    const {
        submitForm,
    } = Context.useContext()

    return (
        <Card
            as='form'
            maxW='45ch'
            w='100%'
            onSubmit={(e) => submitForm(e)}
        >
            <VStack alignItems='stretch' spacing={5} >
                <Heading textAlign='center'>{header}</Heading>

                <Email/>
                <Password/>

                <LoginButton/>
                <ToRegister/>
                <LoginError/>
            </VStack>
        </Card>
    )
}
