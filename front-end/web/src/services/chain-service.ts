import Web3 from 'web3'

import { FACTORY_ADDRESS } from '../config/configs.json'
import * as FACTORY from '../config/factory.json'
import * as KEY_VAULT from '../config/key-vault.json'

export class ChainService {

    private contract: any
    private factory: any
    public contractAddress: string

    public constructor (contractAddress?: string) {
        this.connect()
        this.contractAddress = `${contractAddress}`
        // @ts-ignore
        this.factory = new web3.eth.Contract(FACTORY.abi, FACTORY_ADDRESS)

        if (contractAddress) {
            // @ts-ignore
            this.contract = new web3.eth.Contract(KEY_VAULT.abi, contractAddress)
        }
    }

    private connect (): boolean {
        // @ts-ignore
        if (window.ethereum) {
            // @ts-ignore
            web3 = new Web3(window.ethereum);
            // @ts-ignore
            return window.ethereum.enable();
        }

        throw new Error('Could not connect to the chain')
    }

    public async existingContract (): Promise<any> {
        const userAddress = await this.getAddress()
        // @ts-ignore
        const existingContract = await this.factory.methods.keyVaults(userAddress).call()
        return existingContract === '0x0000000000000000000000000000000000000000' ? '' : existingContract
    }

    public async getAddress (): Promise<string> {
        // @ts-ignore
        return (await web3.eth.getAccounts())[0]
    }

    public async newKeyVault (encSharedKey: string, ownerShare: string, contractShare: string): Promise<void> {
        // @ts-ignore
        await this.broadcast(this.factory.methods.create(), { gas: 2500000 })

        const userAddress = await this.getAddress()
        this.contractAddress = await this.factory.methods.keyVaults(userAddress).call()
        // @ts-ignore
        this.contract = new web3.eth.Contract(KEY_VAULT.abi, this.contractAddress)
        return this.broadcast(this.contract.methods.init(encSharedKey, ownerShare, contractShare), { gas: 2500000 })
    }

    public async authorize (userAddress: string, encShare: string): Promise<void> {
        return this.broadcast(this.contract.methods.authorize(userAddress, encShare))
    }

    public async unauthorize (userAddress: string): Promise<void> {
        return this.broadcast(this.contract.methods.unauthorize(userAddress))
    }

    public async addSecret (name: string, value: string): Promise<void> {
        const secretName = '0x' + Buffer.from(name).toString('hex')
        const secretValue = '0x' + Buffer.from(value).toString('hex')
        return this.broadcast(this.contract.methods.addSecret(secretName, secretValue))
    }

    private async broadcast (transactionMethod: any, options?: any): Promise<any> {
        const defaultOptions = Object.assign({
            from: await this.getAddress(),
            gas: 1500000,
            gasPrice: '300000000000'
        }, options)

        return transactionMethod.send(defaultOptions)
    }

    public async getShare (): Promise<any> {
        return this.contract.methods.getShareByOwner(await this.getAddress()).call()
    }

    public async getAllShares (): Promise<any[]> {
        const allShares = []
        const numberOfShares = await this.contract.methods.sharesLength().call()
        for (let i = 0; i < numberOfShares; i++) {
            allShares.push(
                await this.contract.methods.getShareByIndex(i).call()
            )
        }

        return allShares
    }

    public async getAllSecrets (): Promise<any[]> {
        const allSecrets = []
        const numberOfSecrets = await this.contract.methods.secretsLength().call()
        for (let i = 1; i < numberOfSecrets; i++) {
            const secret = await this.contract.methods.getSecretByIndex(i).call()
            console.log(secret)
            allSecrets.push({
                name: Buffer.from(secret.name.substr(2), 'hex').toString('utf8'),
                value: Buffer.from(secret.value.substr(2), 'hex').toString('utf8'),
            })
        }

        return allSecrets
    }
}
