import KeyVaultController from '../controllers/key-vault-controller'

export const keyVaultRoutes = (expressApp: any) => {
    const router = expressApp.Router()

    router.post('/redistribute', KeyVaultController.redistribute)
    router.post('/challenge', KeyVaultController.getChallenge)
    router.post('/encrypt', KeyVaultController.encrypt)
    router.post('/decrypt', KeyVaultController.decrypt)

    return router
}
