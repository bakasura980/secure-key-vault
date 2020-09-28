import { abi } from './abi.json'
import { Contract, providers } from 'ethers'

class ChainService {

    private provider: any
    static instance: ChainService

    public constructor () {
        if (!ChainService.instance) {
            this.provider = new providers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK)
            ChainService.instance = this
        }

        return ChainService.instance
    }

    public async getShare (contractAddress: string, address = contractAddress): Promise<any> {
        const contract = new Contract(contractAddress, JSON.stringify(abi), this.provider)
        return contract.getShareByOwner(address)
    }

    public async isAuthorized (contractAddress: string, address: string): Promise<any> {
        const share = await this.getShare(contractAddress, address)
        return share.user.toLowerCase() === address.toLowerCase()
    }

}

export default new ChainService()
