import '../../index.css'

import React, { Component, ReactNode } from 'react'
import { UsersComponent, SecretsComponent } from './components'

import { ChainService } from '../../../services'

type Props = {
    contractAddress: string
}

type State = {
    chainService: any
}

class DashboardComponent extends Component<Props, State> {

    public constructor (props: any) {
        super(props)

        this.state = {
            chainService: new ChainService(props.contractAddress)
        }
    }

    render (): ReactNode {
        return (
            <div>
                <h1>Dashboard</h1>
                <h1>{this.props.contractAddress}</h1>
                <form className="dashboard">
                    <div className="dashboard-component">
                        <UsersComponent chainService={this.state.chainService} />
                    </div>
                    <div className="dashboard-component">
                        <SecretsComponent chainService={this.state.chainService} />
                    </div>
                </form>
            </div >
        )
    }
}

export default DashboardComponent
