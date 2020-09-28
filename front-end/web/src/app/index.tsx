import './index.css'
import { API_PUB_KEY } from '../config/configs.json'

import React, { Component, ReactNode } from 'react'

import { ChainService, CryptoService } from '../services'

import { HomePageRenderer } from './renderers'
import { DashboardComponent } from './components'

type State = {
	component: any
	chainService: any
}

class KeyVaultApplication extends Component<{}, State> {

	public constructor (props: any) {
		super(props)

		this.getPublicKey = this.getPublicKey.bind(this)
		this.newKeyVault = this.newKeyVault.bind(this)
		this.existingKeyVault = this.existingKeyVault.bind(this)
		this.onExistingAddressAdding = this.onExistingAddressAdding.bind(this)

		this.state = {
			component: HomePageRenderer(this),
			chainService: new ChainService()
		}
	}

	public render (): ReactNode {
		return (
			<div className="application">
				<div className="application-body">
					{this.state.component}
				</div>
			</div>
		)
	}

	public async getPublicKey () {
		const userAddress = await this.state.chainService.getAddress()
		alert(await CryptoService.getEncPubKeyForAddress(userAddress))
	}

	public async newKeyVault (): Promise<void> {
		const sharedKey = CryptoService.generateSharedKey()
		console.log(sharedKey)
		const shares = CryptoService.splitSharedKey(sharedKey)

		const userAddress = await this.state.chainService.getAddress()
		const encSharedKey = await CryptoService.asymmetricEncryptWithAddress(sharedKey, userAddress)
		const ownerShare = await CryptoService.asymmetricEncryptWithAddress(shares[0], userAddress)
		const contractShare = await CryptoService.asymmetricEncryptWithPubKey(shares[1], API_PUB_KEY)
		await this.state.chainService.newKeyVault(encSharedKey, ownerShare, contractShare)

		this.setState({ component: <DashboardComponent contractAddress={this.state.chainService.contractAddress} /> })
	}

	public async existingKeyVault (): Promise<void> {
		const existingContract = await this.state.chainService.existingContract();
		if (existingContract) {
			return this.setState({ component: <DashboardComponent contractAddress={existingContract} /> })
		}

		alert('You don\'t have a contract yet, please create a new one')
	}

	public onExistingAddressAdding (event: any): void {
		this.setState({ component: <DashboardComponent contractAddress={event.target.value} /> })
	}
}

export default KeyVaultApplication
