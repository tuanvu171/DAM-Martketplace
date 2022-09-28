const base64ToHex = (based64) => Buffer.from(based64, "base64").toString("hex")

export default base64ToHex
