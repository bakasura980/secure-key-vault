import { AES, enc } from 'crypto-js'
const secrets = require('secrets.js-grempe')
import { encrypt, decrypt, recoverPersonalSignature } from 'eth-sig-util'

import { hexToBuffer, bufferToHex, randomNum1To254 } from './utils'

export class CryptoService {

    public static newShare (reconstructionShares: string[]): string {
        return secrets.newShare(randomNum1To254(), reconstructionShares)
    }

    public static reconstructFromShares (reconstructionShares: string[]): string {
        return secrets.combine(reconstructionShares)
    }

    public static symmetricEncrypt (content: string, secret: string): any {
        return AES.encrypt(content, secret).toString()
    }

    public static symmetricDecrypt (encryptedContent: string, secret: string): any {
        return AES.decrypt(encryptedContent, secret).toString(enc.Utf8)
    }

    public static async asymmetricDecrypt (encryptedContent: string, privKey: string): Promise<any> {
        const encBuffer = hexToBuffer(encryptedContent)
        const encData = JSON.parse(encBuffer.toString('utf-8'))
        return decrypt(encData, privKey)
    }

    public static async generateChallenge (subject: string, pubKey: string): Promise<any> {
        const message = secrets.random(512)

        return bufferToHex(
            Buffer.from(
                JSON.stringify(
                    encrypt(
                        pubKey,
                        { data: subject + message },
                        'x25519-xsalsa20-poly1305'
                    )
                ),
                'utf8'
            )
        )
    }

    public static recover (signature: string, message: string): string {
        return recoverPersonalSignature({ data: message, sig: signature })
    }

}
