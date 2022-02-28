import { Hook, HookContext } from '@feathersjs/feathers'
import * as Errors from '@feathersjs/errors'
import { z } from 'zod'

const { NotAuthenticated } = Errors

export const reportError : Hook = ( context ) => {
    console.error(`
[Provider] ${context.params.provider}
[External Enabled] ${context.params.externalEnabled}
[Path] ${context.path}
[Type] ${context.type}
[Method] ${context.method}
[Error] ${context.error}
[Error details Details]\n${JSON.stringify(context.error, null, 2)}
[Data] ${JSON.stringify(context.data, null, 2)}
[Result] ${JSON.stringify(context.result, null, 2)}
    `.trim())
}

export const disableExternal : Hook = ( context ) => {
    context.params.externalEnabled = false
    return context
}
export const enableExternal : Hook = ( context ) => {
    context.params.externalEnabled = true
    return context
}
/** Blocks externals if it hasn't being enabled */
export const blockDisabledExternals : Hook = ( context ) => {
    const isExternal = context.params.provider !== undefined
    const isEnabled = context.params.externalEnabled
    if ( isExternal && ! isEnabled ) {
        throw new Errors.Unavailable('Disabled')
    }
}

// Pre Validation
// Authentication
// Permission -> Permission Validation
// Mutations (Compute)
// Post Validations


// Pre Validation
export const validateWrite = ( type : z.ZodTypeAny ) => ( context : HookContext ) => {
    type.parse(context.data)
    return context
}

// Permission

// Mutations

// Post Validation
export const validateRead = ( type : z.ZodTypeAny ) => ( context : HookContext ) => {
    type.parse(context.result)
    return context
}

export const getAuthenticatedUser = <T = any>( context : HookContext<any> ) : T => {

    const user = context.params?.user as T

    if ( ! user ) {
        throw new NotAuthenticated
    }

    return user
}
