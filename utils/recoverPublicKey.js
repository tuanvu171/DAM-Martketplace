import { ecrecover, toBuffer, pubToAddress, bufferToHex } from "ethereumjs-util"

const uint8ToBase64 = (arr) => Buffer.from(arr).toString("base64")

const recoverPublicKey = (msgHash, v, r, s, chainId) => {
    // const msgHashbuffer = new Buffer(msgHash, "hex")
    // const rbuffer = new Buffer(r, "hex")
    // const sbuffer = new Buffer(s, "hex")
    // const vhex = "0x".concat(v.toString())
    const msgHashbuffer = toBuffer(msgHash)
    const rbuffer = toBuffer(r)
    const sbuffer = toBuffer(s)
    const vhex = toBuffer(v)
    const pubKey = ecrecover(msgHashbuffer, vhex, rbuffer, sbuffer, chainId)
    const pubKeyAddr = pubToAddress(pubKey)
    const pubKeyHex = bufferToHex(pubKeyAddr)
    return pubKeyHex
}

// const msghash = "0xec807763ab629a897bd13f88ce9ebef85ce68eb3af98d5190630a352094e7730"
// const v = 1
// const r = "0xc3ec373535b23465c78d658be11cda128a0c6ecc89dc0ede689e58d9cbd1917e"
// const s = "0x4beddb63305af5d686dc6f0618faa243a033cf80479e4ea3ba8254a8f145e4b4"

export default recoverPublicKey
