import type { Socket } from 'primus'

declare global {
    const Primus : new ( url : string ) => Socket
}
