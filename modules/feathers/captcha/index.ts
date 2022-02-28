import type { Application } from '@feathersjs/express'
import type { HookContext } from '@feathersjs/feathers'
import type { RequestHandler } from 'express'
import type { Session } from 'express-session'

import * as Errors from '@feathersjs/errors'
const { BadRequest } = Errors

import { Verifier, decode } from './crypto'
import { generatePassword } from 'asas-virtuais/modules/common/node'

export const setupCaptcha = () => ( app : Application ) => {

    app.use( ((req, res, next) => {
        const session = (req as any).session as Session & { captcha ?: string }
        if ( ! session.captcha )
            session.captcha = generatePassword(8)
        const feathers = req.feathers
        if ( feathers )
            feathers.captcha = session.captcha
        if ( ! req.cookies?.captcha || req.cookies.captcha !== session.captcha ) {
            res.cookie( 'captcha', session.captcha, {
                maxAge: 600000,
                httpOnly: false
            } )
        }
        if ( feathers ) {
            feathers.clearCaptcha = () => {
                if ( session.captcha ) {
                    delete session.captcha
                }
                res.clearCookie('captcha')
            }
        }
        next()
    }) as RequestHandler )

    app.get('/captcha', ((req, res) => {
        const session = (req as any).session as Session & { captcha ?: string }
        if ( ! session.captcha ) {
            session.captcha = generatePassword(8)
        }
        if ( ! req.cookies?.captcha || req.cookies.captcha !== session.captcha ) {
            res.cookie( 'captcha', session.captcha, {
                maxAge: 600000,
                httpOnly: false
            } )
        }
        res.json(session.captcha)
    }) as RequestHandler)
}

export const verify = (difficulty: number) => {

    return (context : HookContext) => {
        const prefix = context?.params?.captcha
        console.log(prefix)
        if ( ! prefix ) {
            console.log('No prefix')
            throw new BadRequest
        }
        const verifier = Verifier(difficulty, prefix)
        const nonce : string = context.params?.headers?.authorization
        if ( ! nonce ) {
            console.log( 'Missing Nonce' )
            throw new BadRequest
        }
        const decoded = decode( nonce )
        console.log( { nonce, decoded } )
        const verified = verifier.check( Buffer.from( decoded ) )
        if ( context.params.clearCaptcha ) {
            context.params.clearCaptcha()
        }
        if ( ! verified ) {
            console.log( 'Failed verification' )
            throw new BadRequest
        }
        return context
    }
}
