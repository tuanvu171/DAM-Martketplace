import { encrypt } from "eciesjs"
import uint8ToBase64 from "./uint8ToBase64"

const encryptionWithPubKey = (pubKey, msg) => {
    const msgEncrypted = encrypt(pubKey, msg)
    return msgEncrypted
}

export default encryptionWithPubKey
