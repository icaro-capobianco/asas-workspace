import React from 'react'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact, { BugsnagErrorBoundary } from '@bugsnag/plugin-react'

declare global {
    const AsasVirtuais : {
        BugsnagPublicKey: string
    }
}

Bugsnag.start({
  apiKey: AsasVirtuais.BugsnagPublicKey,
  plugins: [new BugsnagPluginReact()]
})

export const ErrorBoundary = Bugsnag.getPlugin('react')?.createErrorBoundary(React) as BugsnagErrorBoundary

export default Bugsnag