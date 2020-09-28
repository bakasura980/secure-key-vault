import { bufferToHex } from 'ethereumjs-util'

export {
    bufferToHex
}

export function hexToBuffer (content: string): Buffer {
    return Buffer.from(content.substr(2), 'hex')
}

// Has to be inRange of [1; 254]
export function randomNum1To254 (): number {
    return Math.random() * (254 - 1) + 1
}
