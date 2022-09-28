import { decrypt } from "eciesjs"
import base64ToArrayBuffer from "./base64ToArrayBuffer"

const decryptionWithPrivKey = (privKey, msg) => {
    const msgDecrypted = decrypt(privKey, msg)
    return msgDecrypted
}

export default decryptionWithPrivKey
