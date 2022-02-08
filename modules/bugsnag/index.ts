import Bugsnag from '@bugsnag/js'
import BugsnagPluginExpress from '@bugsnag/plugin-express'

Bugsnag.start({
  apiKey: process.env.BUGSNAG_PRIVATE_KEY as string,
  plugins: [BugsnagPluginExpress]
})

export default Bugsnag