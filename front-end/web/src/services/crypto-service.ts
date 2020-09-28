import { encrypt } from 'eth-sig-util'
import { bufferToHex } from 'ethereumjs-util'

/*
    secrets object is loaded at global level in index.html as there is 
    an unfixed typescript issue - https://github.com/grempe/secrets.js/issues/20
*/
class CryptoService {

    public generateSharedKey () {
        // @ts-ignore
        return secrets.random(512)
    }

    public splitSharedKey (secret: string) {
        // @ts-ignore
        return secrets.share(secret, 2, 2)
    }

    public async asymmetricEncryptWithAddress (content: string, address: string): Promise<any> {
        const pubKey = await this.getEncPubKeyForAddress(address)
        return this.asymmetricEncryptWithPubKey(content, pubKey)
    }

    public async asymmetricEncryptWithPubKey (content: string, pubKey: string): Promise<any> {
        return bufferToHex(
            Buffer.from(
                JSON.stringify(
                    encrypt(
                        pubKey,
                        { data: content },
                        'x25519-xsalsa20-poly1305'
                    )
                ),
                'utf8'
            )
        );
    }

    public async getEncPubKeyForAddress (address: string) {
        // @ts-ignore
        return ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [address]
        })
    }

    public async asymmetricDecrypt (encContent: any, address: string): Promise<any> {
        // @ts-ignore
        return ethereum.request({
            method: 'eth_decrypt',
            params: [encContent, address]
        })
    }

    public async sign (content: string, address: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            // @ts-ignore
            web3.currentProvider.sendAsync({
                method: 'personal_sign',
                params: [content, address]
            },
                function (err: any, signature: any) {
                    resolve(signature.result)
                })
        })
    }
}

export default new CryptoService()
