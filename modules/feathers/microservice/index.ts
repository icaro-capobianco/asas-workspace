import type { Application } from '@feathersjs/express'
import 'dotenv/config'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import configuration from '@feathersjs/configuration'

// Misc
import cors from 'cors'
import helmet from 'helmet'
import cparser from 'cookie-parser'
import compress from 'compression'
import MicroService from './microservice'

export default async ( cb: (app : Application) => Promise<Application>, options ?: {
    use?: string[]
} ) => {

    const { use = [] } = options || {}

    const app = express(feathers())

    //======================================= MISC
    
    app.use(cors({ origin: true, credentials: true }))
    .use(helmet())
    .use(compress())
    .use(express.json())
    .use(cparser())
    .use(express.urlencoded({ extended: true }))
    
    // For reverse proxy
    app.set('trust proxy', 1)
    
    app.configure(configuration())
    
    
    //======================================= A Single Microservice
    
    for( const service of use ) {
        app.use(service, MicroService(app, service))
    }

    await cb(app)    
    
    //======================================= Protocol
    
    const port : number = app.get('port')
    const host : string = app.get('host')
    const protocol : number = app.get('protocol')
    
    const env = process.env.NODE_ENV as string
    const isDevelopment = env === 'development'
    
    const log = () => console.log(`Running on ${env}\n`, `Listening on ${protocol}://${host}${isDevelopment ? `:${port}` : ''}`)
    
    app.listen(port, log)
    
}
