const hexToBase64 = (hexString) => Buffer.from(hexString, "hex").toString("base64")

export default hexToBase64
