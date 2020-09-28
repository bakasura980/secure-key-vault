import { Request, Response } from 'express'
import { ChainService, CryptoService } from '../services'

class KeyVaultController {

    public redistribute = async (req: Request, res: Response): Promise<void> => {
        const userShare = req.body.share
        const encApiShare = await ChainService.getShare(req.body.contract)
        const apiShare = await CryptoService.asymmetricDecrypt(encApiShare.encShare, process.env.PRIV_KEY)

        const result = CryptoService.newShare([userShare, apiShare])
        res.send(result)
    }

    public encrypt = async (req: Request, res: Response): Promise<void> => {
        const userShare = req.body.share
        const encApiShare = await ChainService.getShare(req.body.contract)
        const apiShare = await CryptoService.asymmetricDecrypt(encApiShare.encShare, process.env.PRIV_KEY)

        const sharedKey = CryptoService.reconstructFromShares([userShare, apiShare])
        const result = await CryptoService.symmetricEncrypt(req.body.secret, sharedKey)
        res.send(result)
    }

    public getChallenge = async (req: Request, res: Response): Promise<void> => {
        const challenge = await CryptoService.generateChallenge('Authentication challenge: ', req.body.pubKey)
        res.send(JSON.stringify(challenge))
    }

    public decrypt = async (req: Request, res: Response): Promise<void> => {
        const address = CryptoService.recover(req.body.challenge.signature, req.body.challenge.challenge)
        const isAuthorized = await ChainService.isAuthorized(req.body.contract, address)
        if (!isAuthorized) {
            res.status(403).send({ message: 'Unauthorized access' })
        }

        const userShare = req.body.share
        const encApiShare = await ChainService.getShare(req.body.contract)
        const apiShare = await CryptoService.asymmetricDecrypt(encApiShare.encShare, process.env.PRIV_KEY)
        const sharedKey = CryptoService.reconstructFromShares([userShare, apiShare])

        const result = await CryptoService.symmetricDecrypt(req.body.encSecret, sharedKey)
        res.send(result)
    }

}

export default new KeyVaultController()
