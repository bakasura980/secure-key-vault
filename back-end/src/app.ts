import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'
import { createServer, Server } from 'http'

import { registerApiRoutes } from './api/routes/api-router'
import APIErrorHandler from './api/middleware/global-error-handler'

export class APIServer {

    public static readonly PORT: number = 80
    private app: express.Application
    private server: Server
    private port: string | number

    public constructor () {
        this.createApp()
        this.config()
        this.createServer()
        this.registerRoutes()
        this.errorHandling()
        this.listen()
    }

    private createApp (): void {
        this.app = express()
    }

    private config (): void {
        this.port = process.env.PORT
        this.app.use(cors())
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: true }))
    }

    private createServer (): void {
        this.server = createServer(this.app)
    }

    private registerRoutes (): void {
        registerApiRoutes(this.app)
    }

    private errorHandling (): void {
        const apiErrorHandler = new APIErrorHandler(this.app)
        this.app = apiErrorHandler.handleErrors()
    }

    private listen (): void {
        this.server.listen(this.port, async () => {
            console.log('  App is running at http://localhost:%d', this.port)
            console.log('  Press CTRL-C to stop\n')

            console.log(`Service has started  App is running at http://localhost:${this.port}`)
        })
    }

    public getApp (): express.Application {
        return this.app
    }

}
