import { WebClient } from './web-client'
import { KEY_VAULT_API } from '../config/configs.json'

export class KeyVaultClient {

    public static async redistribute (contract: string, share: string): Promise<string> {
        return WebClient.post(`${KEY_VAULT_API}/redistribute`, {
            contract,
            share
        })
    }

    public static async encrypt (contract: string, share: string, secret: string): Promise<string> {
        return WebClient.post(`${KEY_VAULT_API}/encrypt`, {
            contract,
            share,
            secret
        })
    }

    public static async getChallenge (pubKey: string): Promise<string> {
        return WebClient.post(`${KEY_VAULT_API}/challenge`, { pubKey })
    }

    public static async decrypt (contract: string, share: string, challenge: any, encSecret: string): Promise<string> {
        return WebClient.post(`${KEY_VAULT_API}/decrypt`, {
            contract,
            share,
            challenge,
            encSecret
        })
    }

}
