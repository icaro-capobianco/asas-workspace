import { createClient } from 'redis'
import session, { MemoryStore } from 'express-session'
import connectRedis from 'connect-redis'

export default async ( app : any ) => {
    const RedisStore = connectRedis(session)

    const env = process.env.NODE_ENV

    const isDevelopment = env === 'development'

    const protocol = isDevelopment ? 'redis' : 'rediss'

    const username = process.env.REDIS_USER as string
    const password = process.env.REDIS_PASS as string
    const host = process.env.REDIS_HOST as string
    const port = process.env.REDIS_PORT as string
    const url = `${protocol}://${username}:${password}@${host}:${port}`
    const redisStore = () => new RedisStore( { client: createClient({url, tls: { host } }) } )

    app.use(
        session({
            store: isDevelopment ? new MemoryStore() : redisStore(),
            secret: process.env.SESSION_SECRET as string,
            resave: true,
            saveUninitialized: true,
            cookie: {
                secure: ! isDevelopment,
                httpOnly: isDevelopment,
                maxAge:  1 * 24 * 60 * 60 * 1000,
            },
        })
    )
}
