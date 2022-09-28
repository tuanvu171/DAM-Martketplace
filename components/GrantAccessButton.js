import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    TextField,
} from "@mui/material"
import React, { useState } from "react"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { connectStorageEmulator, getBytes, getDownloadURL, ref } from "firebase/storage"
import { db, storage } from "../firebase"
import encryptionWithPubKey from "../utils/encryptionWithPubKey"
import decryptionWithPrivKey from "../utils/decryptionWithPrivKey"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { utils } from "eciesjs"
import rnd256 from "../utils/rnd256"
import { sha256 } from "ethereumjs-util"
import { useMoralis, useMoralisFile, useWeb3Contract } from "react-moralis"
import arrayBufferToBase64 from "../utils/arrayBufferToBase64"
import getIpfsFile from "../utils/getIpfsFile"
import useGlobalState from "../hooks/useGlobalState"
import abi from "../constants/abi"
import base64ToHex from "../utils/base64ToHex"
import removeItemOnce from "../utils/removeItemOnce"
import arrayBufferToBuffer from "../utils/arrayBufferToBuffer"

function GrantAccessButton({ customerAddr, itemData, itemId, setOpenBackDrop }) {
    const [openGrantAccess, setOpenGrantAccess] = useState(false)
    const [symmetricKeyToDisplay, setSymmetricKeyToDisplay] = useState("")
    const { saveFile } = useMoralisFile()
    const { account } = useMoralis()
    const [ipfsReference] = useGlobalState("ipfsReference")
    const [encryptedFileHash_smartcontract, setEncryptedFileHash_smartcontract] = useState()
    const [signedSymmetricKey_smartcontract, setSignedSymmetricKey_smartcontract] = useState()
    const [ipfsURI_smartcontract, setIpfsURI_smartcontract] = useState()
    const [customerPublicKey, setCustomerPublicKey] = useState()

    const handleClickOpenGrantAccess = () => {
        setOpenGrantAccess(true)
    }

    const handleCloseGrantAccess = () => {
        setOpenGrantAccess(false)
    }

    const handleSymmetricKey = (event) => {
        setSymmetricKeyToDisplay(event.target.value)
    }

    const generateRandomSymmetricKey = async () => {
        setOpenBackDrop(true)
        // Generate random symmetric key
        const symmetricKey = rnd256()

        // Display symmetricKey
        setSymmetricKeyToDisplay(
            "0x" + symmetricKey.reduce((o, v) => o + ("00" + v.toString(16)).slice(-2), "")
        )

        // Get Item's source file from db
        const fileStorageRef = ref(storage, `files/${itemData.owner}/sword.PNG`)
        const fileFromUrl = await getBytes(fileStorageRef)
        const file_Base64 = arrayBufferToBase64(fileFromUrl)

        // Get user public key
        const documentRef = doc(db, "customers", customerAddr)
        const pubKey = (await getDoc(documentRef)).data().public_key

        // Encrypt the file with the symmetric key
        const encryptedFile_arrayBuffer = utils.aesEncrypt(symmetricKey, file_Base64)
        const encryptedFile_base64 = arrayBufferToBase64(encryptedFile_arrayBuffer)

        // Sign the symmetricKey with public key
        const signedSymmetricKey_arrayBuffer = encryptionWithPubKey(pubKey, symmetricKey)
        const signedSymmetricKey_base64 = arrayBufferToBase64(signedSymmetricKey_arrayBuffer)
        // setSignedSymmetricKey_smartcontract(signedSymmetricKey_base64)

        // // test
        // const recoveredSignedSymmetricKey = decryptionWithPrivKey(
        //     privKey,
        //     signedSymmetricKey_arrayBuffer
        // )
        // const decryptedFile = utils.aesDecrypt(
        //     recoveredSignedSymmetricKey,
        //     encryptedFile_arrayBuffer
        // )
        // console.log(`file_Base64:${file_Base64}`)
        // console.log(`decryptedFile: ${decryptedFile}`)
        // console.log(file_Base64 == decryptedFile)

        // Calculate Hash
        const encryptedFileHash_Array = sha256(encryptedFile_arrayBuffer)
        const encryptedFileHash_Base64 = arrayBufferToBase64(encryptedFileHash_Array)
        // setEncryptedFileHash_smartcontract(encryptedFileHash_Base64)

        // Upload encrypted file to IPFS
        try {
            const result = await saveFile(
                itemData.name.replace(" ", ""),
                { base64: btoa(encryptedFile_base64) },
                {
                    type: "base64",
                    saveIPFS: true,
                }
            )
            console.log(result.ipfs())
            const ipfsURI = result.ipfs()
            setIpfsURI_smartcontract(ipfsURI.toString())
        } catch (error) {
            alert(error.message)
        }

        setEncryptedFileHash_smartcontract(encryptedFileHash_Base64)
        setSignedSymmetricKey_smartcontract(signedSymmetricKey_base64)

        setOpenBackDrop(false)
    }

    const handleGrantAccess = async () => {
        setOpenBackDrop(true)
        handleCloseGrantAccess()

        console.log(`ipfsURI_smartcontract: ${ipfsURI_smartcontract}`)
        console.log(`signedSymmetricKey_smartcontract: ${signedSymmetricKey_smartcontract}`)
        console.log(`encryptedFileHash_smartcontract: ${encryptedFileHash_smartcontract}`)

        await grantAccess({
            onSuccess: handleSuccessGrantAccess,
            onError: (error) => {
                setOpenBackDrop(false)
                console.log(error)
            },
        })
    }

    const handleSuccessGrantAccess = async (tx) => {
        await tx.wait(1)

        // update item's attribute: customers_granting
        const documentReference = doc(db, "items_listed", itemId)
        const docSnap = await getDoc(documentReference)
        if (docSnap.exists()) {
            let customersGrantingList = docSnap.data().customers_granting
            if (!customersGrantingList) {
                customersGrantingList = [customerAddr]
            } else {
                customersGrantingList.push(customerAddr)
            }
            await updateDoc(documentReference, {
                customers_granting: customersGrantingList,
            })
        }

        // update item's attribute: delete customers_requesting
        if (docSnap.exists()) {
            const customersRequestingList = docSnap.data().customers_requesting
            const updatedRequestingList = removeItemOnce(customersRequestingList, customerAddr)
            await updateDoc(documentReference, {
                customers_requesting: updatedRequestingList,
            })
        }

        setOpenBackDrop(false)
    }

    const {
        runContractFunction: grantAccess,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: itemData.contract_address,
        functionName: "grantAccess",
        params: {
            customerAddr: customerAddr,
            encryptedFileHash: encryptedFileHash_smartcontract,
            encryptedSymmetricKey: signedSymmetricKey_smartcontract,
            ipfsURI: ipfsURI_smartcontract,
        },
    })

    // const testFunction = () => {
    //     const pubKey =
    //         "b834edfdb388102328e41a045569c27bcb61b3ee2e70d07ab54097a47850928fdf74eab6deb20309ab308c297011246ff648b70091cac2854e09bb946312a8e1"
    //     const privKey = "9242159707b322822ee2164f2cf2bae054621a4658dd366ac28a214cfb7d7f95"
    //     const msg = "tuanvu"
    //     const signedKey = encryptionWithPubKey(pubKey, symmetricKey)
    //     console.log(signedKey)

    //     const keyEncrypted = decryptionWithPrivKey(privKey, signedKey)
    //     console.log(keyEncrypted)

    //     const r = "0x21a36b8d5f31a71e29fdfc50aa6c8f5f93c6eec6c19e606effd5bd0eb595be5f"
    //     const s = "0x02c05af656513f707ab6aa86b17f13bce28597c19aa9bf9c09ec4b34ae6490ec"
    //     const v = 0
    //     const msgHash = "0xe5c85782187013e07b5ed54eab14fa1a0176188b055487fed830069f3112f97f"
    //     const chainId = "4"
    //     const publickey = recoverPublicKey(msgHash, v, r, s, chainId)
    //     console.log(publickey)
    // }

    return (
        <div>
            <CheckCircleOutlineIcon
                color="success"
                className="ml-1 cursor-pointer"
                onClick={handleClickOpenGrantAccess}
            />
            <Dialog open={openGrantAccess} onClose={handleCloseGrantAccess}>
                <DialogTitle>Grant access to the item</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        By clicking "Grant Access", you will make a 2-stage encryption on the file
                        and stored it on IPFS.
                    </DialogContentText>
                    <DialogContentText>
                        You must provide a symmetric key for the first stage.
                    </DialogContentText>
                    <DialogContentText>
                        Necessary information will be transfered to the smart contract.
                    </DialogContentText>
                    <div className="flex flex-row">
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Symmetric Key"
                            fullWidth
                            variant="standard"
                            value={symmetricKeyToDisplay}
                            onChange={handleSymmetricKey}
                        />
                        <Button onClick={generateRandomSymmetricKey} className="ml-2">
                            Generate
                        </Button>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGrantAccess} disabled={isLoading || isFetching}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGrantAccess}
                        disabled={isLoading || isFetching || !signedSymmetricKey_smartcontract}
                    >
                        Grant Access
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default GrantAccessButton
