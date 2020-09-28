import * as express from 'express'

import { keyVaultRoutes } from './key-vault-routes'

export const registerApiRoutes = (app: any) => {
    app.use('/api', keyVaultRoutes(express))
}
