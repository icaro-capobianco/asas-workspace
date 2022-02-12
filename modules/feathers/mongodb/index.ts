import { MongoClient } from 'mongodb'

export default async () => {
    const user = process.env.MDB_USER
    const pass = process.env.MDB_PASS
    const host = process.env.MDB_HOST
    const url = `mongodb+srv://${user}:${pass}@${host}`
    return MongoClient.connect( url )
}
