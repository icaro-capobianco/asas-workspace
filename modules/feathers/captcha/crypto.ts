import PoW from 'proof-of-work'
import { encode as bencode, decode as bdecode } from 'js-base64'

export const work = ( difficulty : number, prefix : string = '' ) => {
    const buffer = (new PoW.Solver).solve(difficulty, Buffer.from(prefix, 'hex'))
    const base64 = bencode( buffer.toString() )
    console.log( {buffer, base64} )
    return base64
}

export const Verifier = ( difficulty : number, prefix : string = '' ) => {
    const v = new PoW.Verifier({
        size: 1024,
        n: 16,
        complexity: difficulty,
        prefix: Buffer.from(prefix, 'hex'),
        validity: 60000
    })
    return v
}

export const decode = ( base64 : string ) => {
    const decoded = bdecode(base64)
    const buffer = new Uint8Array( decoded.split(',').map( i => parseInt(i) ) )
    console.log({buffer, base64})
    return buffer
}
