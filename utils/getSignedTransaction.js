import { ecsign, keccak256 } from "ethereumjs-util"
import { encode } from "rlp"
import arrayBufferToBase64 from "./arrayBufferToBase64"
import arrayBufferToBuffer from "./arrayBufferToBuffer"
import base64ToArrayBuffer from "./base64ToArrayBuffer"
import base64ToHex from "./base64ToHex"
import hexToBase64 from "./hexToBase64"

function buf2hex(buffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("")
}

const getSignedTransaction = (nonce, gasPrice, gasLimit, to, value, data) => {
    const params = [nonce, gasPrice, gasLimit, to, value, data]
    // Raw transaction as Buffer
    const rawTransaction = encode(params)
    const rawTransaction_buffer = arrayBufferToBuffer(rawTransaction)
    const hash = keccak256(rawTransaction_buffer)

    // Signature of the hash of the raw transaction
    // const privateKey_hex = "9242159707b322822ee2164f2cf2bae054621a4658dd366ac28a214cfb7d7f95"
    // const privateKey_Uint8Array = Uint8Array.from(Buffer.from(privateKey_hex, "hex"))
    // const chainId = 0
    // const { v, r, s } = ecsign(hash, privateKey_Uint8Array, chainId)
    // console.log(`v:${v}`)
    // console.log(`r:${base64ToHex(arrayBufferToBase64(r))}`)
    // console.log(`s:${base64ToHex(arrayBufferToBase64(s))}`)
    const r = "0x5d71f761ca3f53b1e45fbda461642fff8b2ceb09330ea2756ed142b8584c5e2d"
    const s = "0x06c292b7fbd348253634b7bb2ed9beba230611a2d9d1665a182ef2f2e0b2c9ba"
    const v = 1

    // RLP encoded signed transaction as Buffer
    const signedTransaction = encode([nonce, gasPrice, gasLimit, to, value, data, v, r, s])
    const signedTransaction_hex = "0x" + buf2hex(signedTransaction)
    return signedTransaction_hex
}

export default getSignedTransaction
