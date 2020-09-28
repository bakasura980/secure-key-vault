import axios, { Method } from 'axios'

const executeRequest = async function (type: string, url: string, data: any, headers: any = {}) {
    try {
        const result = await axios({
            method: type as Method,
            headers,
            url,
            data
        })

        return result.data
    } catch (error) {
        throw new Error(error.data)
    }
}

export class WebClient {

    public static async get (url: string, headers: any = {}) {
        return executeRequest('GET', url, {}, headers)
    }

    public static async post (url: string, data: any, headers: any = {}) {
        return executeRequest('POST', url, data, headers)
    }

}
