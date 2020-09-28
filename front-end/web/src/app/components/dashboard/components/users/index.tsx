import '../../../../index.css'

import React, { Component, ReactNode } from 'react'
import { TableRenderer, AuthorizeRenderer } from './renderers'

import { KeyVaultClient } from '../../../../../clients'
import { CryptoService } from '../../../../../services'

type Props = {
    chainService: any
}

type State = {
    chainService: any
    newUserAddress: string
    newUserPubKey: string
    authorized: any[]
}

class UsersComponent extends Component<Props, State> {

    public constructor (props: any) {
        super(props)

        this.onAddressAdding = this.onAddressAdding.bind(this)
        this.onPubKeyAdding = this.onPubKeyAdding.bind(this)

        this.authorize = this.authorize.bind(this)
        this.unauthorize = this.unauthorize.bind(this)

        this.state = {
            chainService: props.chainService,
            newUserAddress: '',
            newUserPubKey: '',
            authorized: []
        }
    }

    public async componentDidMount () {
        this.setState({ authorized: await this.state.chainService.getAllShares() })
    }

    public render (): ReactNode {
        return (
            <div>
                {AuthorizeRenderer(this)}
                {TableRenderer(this)}
            </div>
        )
    }


    public onAddressAdding (event: any): void {
        this.setState({ newUserAddress: event.target.value })
    }

    public onPubKeyAdding (event: any): void {
        this.setState({ newUserPubKey: event.target.value })
    }

    async authorize (): Promise<void> {
        const encShare = await this.state.chainService.getShare()
        const userAddress = await this.state.chainService.getAddress()
        const plainShare = await CryptoService.asymmetricDecrypt(encShare.encShare, userAddress)

        const newUserShare = await KeyVaultClient.redistribute(
            this.state.chainService.contractAddress,
            plainShare
        )

        const newUserEncShare = await CryptoService.asymmetricEncryptWithPubKey(newUserShare, this.state.newUserPubKey)
        await this.state.chainService.authorize(this.state.newUserAddress, newUserEncShare)

        this.state.authorized.push({ user: this.state.newUserAddress, encShare: newUserEncShare })
        this.setState({ authorized: this.state.authorized })
    }

    async unauthorize (index: number, userAddress: string): Promise<void> {
        await this.state.chainService.unauthorize(userAddress)

        this.state.authorized.splice(index, 1)
        this.setState({ authorized: this.state.authorized })
    }
}

export default UsersComponent
