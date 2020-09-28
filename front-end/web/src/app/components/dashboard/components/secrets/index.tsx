import '../../../../index.css'

import React, { Component, ReactNode } from 'react'
import { TableRenderer, NewSecretRenderer } from './renderers'

import { KeyVaultClient } from '../../../../../clients'
import { CryptoService } from '../../../../../services'

type Props = {
    chainService: string
}

type State = {
    chainService: any
    secretName: string
    secretValue: string,
    secrets: any[]
}

class SecretsComponent extends Component<Props, State> {

    public constructor (props: any) {
        super(props)

        this.onSecretNameAdding = this.onSecretNameAdding.bind(this)
        this.onSecretValueAdding = this.onSecretValueAdding.bind(this)

        this.addSecret = this.addSecret.bind(this)
        this.revealSecret = this.revealSecret.bind(this)

        this.state = {
            chainService: props.chainService,
            secretName: '',
            secretValue: '',
            secrets: []
        }
    }

    public async componentDidMount () {
        this.setState({ secrets: await this.state.chainService.getAllSecrets() })
    }

    public render (): ReactNode {
        return (
            <div>
                {NewSecretRenderer(this)}
                {TableRenderer(this)}
            </div>
        )
    }

    public onSecretNameAdding (event: any): void {
        this.setState({ secretName: event.target.value })
    }

    public onSecretValueAdding (event: any): void {
        this.setState({ secretValue: event.target.value })
    }

    async addSecret (): Promise<void> {
        const encShare = await await this.state.chainService.getShare()
        const userAddress = await this.state.chainService.getAddress()
        const plainShare = await CryptoService.asymmetricDecrypt(encShare.encShare, userAddress)
        const encSecret = await KeyVaultClient.encrypt(
            this.state.chainService.contractAddress,
            plainShare,
            this.state.secretValue
        )

        await this.state.chainService.addSecret(this.state.secretName, encSecret)

        this.state.secrets.push({ name: this.state.secretName, value: encSecret })
        this.setState({ secrets: this.state.secrets })
    }

    async revealSecret (index: number, encSecretValue: string): Promise<void> {
        const userAddress = await this.state.chainService.getAddress()

        const userPubKey = await CryptoService.getEncPubKeyForAddress(userAddress)
        const encChallenge = await KeyVaultClient.getChallenge(userPubKey)
        const challenge = await CryptoService.asymmetricDecrypt(encChallenge, userAddress)

        const encShare = await this.state.chainService.getShare()
        const plainShare = await CryptoService.asymmetricDecrypt(encShare.encShare, userAddress)

        const signature = await CryptoService.sign(challenge, userAddress)
        const secretValue = await KeyVaultClient.decrypt(
            this.state.chainService.contractAddress,
            plainShare,
            { challenge, signature },
            encSecretValue
        )

        this.state.secrets[index].value = secretValue
        this.setState({ secrets: this.state.secrets })
    }
}

export default SecretsComponent
