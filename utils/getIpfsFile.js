// import * as IPFS from "ipfs-core"

const getIpfsFile = async (ipfsReference, ipfsURI) => {
    const stream = ipfsReference.cat(ipfsURI.slice(ipfsURI.indexOf("/ipfs/") + 6))
    const decoder = new TextDecoder()
    let data = ""

    for await (const chunk of stream) {
        // chunks of data are returned as a Uint8Array, convert it back to a string
        data += decoder.decode(chunk, { stream: true })
    }

    return data
}

export default getIpfsFile
