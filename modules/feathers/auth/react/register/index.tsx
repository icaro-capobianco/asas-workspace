import { Input, Button, FormControl, FormLabel, Heading, VStack, Tooltip, Alert, AlertIcon } from '@chakra-ui/react'
import Card from 'asas-virtuais/modules/react/components/card';
import { Link } from 'react-router-dom'

import * as Captcha from 'asas-virtuais/modules/feathers/captcha/react'
import Context, { Props } from './context'
import * as Login from '../login/context'
import { FC, useEffect } from 'react'
import Auth from 'asas-virtuais/modules/feathers/auth/react/context'

export const Provider : FC<Props & Login.Props> = ( { children, onSuccess, ...props } ) => {
    return (
        <Login.Provider onSuccess={onSuccess} >
            <Captcha.Provider>
                <Context.Provider {...props} >
                    {children}
                </Context.Provider>
            </Captcha.Provider>
        </Login.Provider>
    )
}

export const BasicRegistration : FC<{ heading ?: string }> = ( { heading = 'Register Account' } ) => {

    const {
        submitForm
    } = Context.useContext()


    return (
        <Card
            as='form'
            maxW='45ch'
            w='100%'
            onSubmit={submitForm}
        >
            <VStack alignItems='stretch' spacing={5} >
                <Heading textAlign='center'>{heading}</Heading>

                <Email/>
                <Password/>
                <ConfirmPassword/>
                <CaptchaComponent/>
                <RegisterButton/>
                <ToLoginButton/>
                <RegisterError/>
                <LoginError/>
            </VStack>
        </Card>
    )
}

export const Email = ( {
    label = 'Email'
} : {
    label ?: string
} ) => {
    const {
        email,
        setEmail,
        loading,
    } = Context.useContext()

    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <Input
                required
                type='text'
                disabled={loading}
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
        </FormControl>
    )
}

export const Password = ( {
    label = 'Password'
} : {
    label ?: string
} ) => {
    const {
        password,
        setPassword,
        loading,
    } = Context.useContext()

    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <Input
                min={6}
                required
                type='password'
                disabled={loading}
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
        </FormControl>
    )
}

export const ConfirmPassword = ( {
    label = 'Confirm Password',
    tooltip = 'Must be equal to the password'
} : {
    label ?: string
    tooltip ?: string
} ) => {
    const {
        confirmPassword,
        setConfirmPassword,
        loading,
        conflictPasswords,
    } = Context.useContext()

    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <Tooltip label={tooltip} placement='top' isOpen={conflictPasswords} >
                <Input
                    required
                    type='password'
                    disabled={loading}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    outline={conflictPasswords?'1px solid red' : ''}
                />
            </Tooltip>
        </FormControl>
    )
}

export const CaptchaComponent : FC = ( { children = 'I am not a robot' } ) => {

    const { create, loading } = Context.useContext()
    const { pow, working } = Captcha.useContext()
    useEffect(() => {
        if ( pow && pow !== create.params?.headers?.authorization ) {
            create.setParams({
                headers: {
                    'authorization': pow
                }
            })
        }
    }, [pow, create.setParams, create.params])

    return (
        <Captcha.HumanCheckbox _disabled={{opacity: 0.5}} disabled={working || loading} >
            {children}
        </Captcha.HumanCheckbox>
    )
}

export const RegisterButton : FC = ( { children = 'Register my account' } ) => {
    const { loading } = Context.useContext()
    const { pow } = Captcha.useContext()
    return <Button disabled={loading || ! pow} type="submit" >{children}</Button>
}

export const ToLoginButton : FC<{route?: string}> = ( {
    children = 'I already have an account',
} ) => {

    const { routes } = Auth.useContext()
    const { loading } = Context.useContext()
    return  <Button as={Link} to={routes.login.path} disabled={loading} >{children}</Button>
}

export const RegisterError : FC = ( { children = 'Failure on registration' } ) => {
    const { error } = Context.useContext()
    return (error && <Alert status='error'><AlertIcon/>{children}</Alert>) || null
}

export const LoginError : FC = ( { children = 'Failure on authentication' } ) => {
    const { login } = Context.useContext()
    return (login.error && <Alert status='error'><AlertIcon/>{children}</Alert>) || null
}
