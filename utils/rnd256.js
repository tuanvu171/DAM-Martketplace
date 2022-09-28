function rnd256() {
    const bytes = new Uint8Array(32)
    window.crypto.getRandomValues(bytes)
    const bytesHex = bytes.reduce((o, v) => o + ("00" + v.toString(16)).slice(-2), "")
    // return BigInt("0x" + bytesHex).toString(10)
    return bytes
}
export default rnd256
