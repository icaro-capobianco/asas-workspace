import Oprf from 'oprf'
import forge from 'node-forge'
import CryptoJS from 'crypto-js'

const { AES, enc } = CryptoJS

const { pki } = forge

export const oprf = new Oprf()

export module OPRF {
    export const client = ( password : string ) => {
        const masked = oprf.maskInput(password)
        return {
            str : oprf.encodePoint(masked.point, 'ASCII'),
            mask : masked.mask
        }
    }

    export const server = ( clientR : string, key : string ) => {
        const maskedPoint = oprf.decodePoint(clientR, 'ASCII')
        const salted = oprf.scalarMult(maskedPoint, oprf.hashToPoint(key))
        return oprf.encodePoint(salted, 'ASCII')
    }

    export const validateResult = ( result : string ) => {
        if ( ! oprf.isValidPoint( oprf.decodePoint( result, 'ASCII' ) ) ) {
            throw new Error('Invalid OPRF result')
        }
    }

    export const solveOPRF = ( mask: Uint8Array, serverR: string ) => {
    
        const _salted = oprf.decodePoint(serverR, 'ASCII'); 
        const unmasked = oprf.unmaskPoint(_salted, mask)
        return oprf.encodePoint(unmasked, 'ASCII')
    }

}

export const envelope = ( key: string, data : any ) => {
    console.log( {key, data} )
    return AES.encrypt(JSON.stringify(data), key).toString()
}

export const openEnvelope = ( key : string, data : any ) => {
    console.log( {key, data} )
    return JSON.parse(AES.decrypt(data, key).toString(enc.Utf8))
}

export module PPK {

    export function generateKeyPair() {
        const keypair = pki.rsa.generateKeyPair({bits: 2048, e: 0x10001})
        const vk = pki.publicKeyToPem(keypair.publicKey)
        const sk = pki.privateKeyToPem(keypair.privateKey)
        return ({vk, sk})
    }

    export const sign = ( sk : string, data : any ) => {
        let pss = forge.pss.create({
            md: forge.md.sha512.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha512.create()),
            saltLength: 20
        })
        let md = forge.md.sha512.create()
        md.update(JSON.stringify(data), 'utf8')
        return forge.util.encode64(pki.privateKeyFromPem(sk).sign(md, pss))
    }

    export const validateSignature = ( data : any, vk : string, signature : string ) => {
        let pss = forge.pss.create({
            md: forge.md.sha512.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha512.create()),
            saltLength: 20
        })
        let md = forge.md.sha512.create()
        md.update(JSON.stringify(data), 'utf8')
        let verified = pki.publicKeyFromPem(vk).verify(
            md.digest().getBytes(),
            forge.util.decode64(signature),
            pss
        )
        if ( ! verified ) {
            throw new Error('Invalid Signature')
        }
    }
}

