import React from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import {
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    TextField,
    Tooltip,
} from "@mui/material"
import { Button } from "@web3uikit/core"
import { useEffect, useState } from "react"
import abi from "../../constants/abi"
import { db } from "../../firebase"
import { addDoc, collection, doc, getDoc, setDoc, updateDoc, where } from "firebase/firestore"
import getIpfsFile from "../../utils/getIpfsFile"
import useGlobalState from "../../hooks/useGlobalState"
import base64ToArrayBuffer from "../../utils/base64ToArrayBuffer"
import { sha256, sha256FromArray } from "ethereumjs-util"
import arrayBufferToBase64 from "../../utils/arrayBufferToBase64"
import removeItemOnce from "../../utils/removeItemOnce"
import hexToString from "../../utils/hexToString"
import hexToBase64 from "../../utils/hexToBase64"
import decryptionWithPrivKey from "../../utils/decryptionWithPrivKey"
import { utils } from "eciesjs"
import arrayBufferToBuffer from "../../utils/arrayBufferToBuffer"
import base64ToHex from "../../utils/base64ToHex"

function ConfirmHashButton({ itemId, smartContractAddress, enableConfirmHash, setOpenBackDrop }) {
    const [openConfirmHash, setOpenConfirmHash] = useState(false)
    const [openConfirmHashSuccessBar, setOpenConfirmHashSuccessBar] = useState(false)
    const [ipfsURI, setIpfsURI] = useState()
    const { account } = useMoralis()
    const [ipfsReference] = useGlobalState("ipfsReference")
    const [encryptedFileHash, setEncryptedFileHash] = useState()
    const [signedSymmetricKey, setSignedSymmetricKey] = useState()
    const [encryptedFile_arrayBuffer_result, setEncryptedFile_arrayBuffer_result] = useState()

    const handleClickOpenConfirmHash = async () => {
        setOpenConfirmHash(true)
    }

    const handleCloseConfirmHash = () => {
        setOpenConfirmHash(false)
    }

    const { runContractFunction: getIpfsURI } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "getIpfsURI",
        params: {
            customerAddr: account,
        },
    })

    const {
        runContractFunction: compareHashes,
        isFetching,
        isLoading,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "compareHashes",
        params: {
            customerHash: encryptedFileHash,
        },
    })

    const { runContractFunction: getEncryptedSymmetricKey } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "getEncryptedSymmetricKey",
        params: {},
    })

    const handleGetIpfsURI = async () => {
        setOpenBackDrop(true)
        // Get ipfs link from the smart contract
        await getIpfsURI({
            onSuccess: (tx) => {
                setIpfsURI(tx)
            },
            onError: (error) => {
                console.log(error)
            },
        })
        setOpenBackDrop(false)
    }

    const handleGetHash = async () => {
        setOpenBackDrop(true)
        const encryptedFile_base64 = await getIpfsFile(ipfsReference, ipfsURI)
        const encryptedFile_arrayBuffer = base64ToArrayBuffer(encryptedFile_base64)
        setEncryptedFile_arrayBuffer_result(encryptedFile_arrayBuffer)
        const encryptedFile_Buffer = Buffer.from(new Uint8Array(encryptedFile_arrayBuffer))
        const encryptedFileHash_Array = sha256(encryptedFile_Buffer)
        const encryptedFileHash_Base64 = arrayBufferToBase64(encryptedFileHash_Array)
        // const encryptedFileHash_Hex = base64ToHex(encryptedFileHash_Base64)
        setEncryptedFileHash(encryptedFileHash_Base64)
        setOpenBackDrop(false)
    }

    const handleConfirmHash = async () => {
        setOpenBackDrop(true)
        handleCloseConfirmHash()

        await compareHashes({
            onSuccess: handleSuccessConfirmHash,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleSuccessConfirmHash = async (tx) => {
        await tx.wait(1)

        // update item's attribute: delete customers_granting
        const documentReference = doc(db, "items_listed", itemId)
        const docSnap = await getDoc(documentReference)
        if (docSnap.exists()) {
            const customersGrantingList = docSnap.data().customers_granting
            const updatedGrantingList = removeItemOnce(customersGrantingList, account)
            await updateDoc(documentReference, {
                customers_granting: updatedGrantingList,
            })
        }

        // get symmetricKey
        const signedSymmetricKey_base64 = await getEncryptedSymmetricKey()
        // console.log(`signedSymmetricKey_base64:${signedSymmetricKey_base64}`)
        // setSignedSymmetricKey(signedSymmetricKey_base64)
        const signedSymmetricKey_arrayBuffer = base64ToArrayBuffer(signedSymmetricKey_base64)
        const signedSymmetricKey_buffer = arrayBufferToBuffer(signedSymmetricKey_arrayBuffer)
        const privKey = "9242159707b322822ee2164f2cf2bae054621a4658dd366ac28a214cfb7d7f95"

        const recoveredSignedSymmetricKey_buffer = decryptionWithPrivKey(
            privKey,
            signedSymmetricKey_buffer
        )
        // console.log(`recoveredSignedSymmetricKey_buffer: ${recoveredSignedSymmetricKey_buffer}`)
        const encryptedFile_buffer_result = arrayBufferToBuffer(encryptedFile_arrayBuffer_result)
        const decryptedFile = utils.aesDecrypt(
            recoveredSignedSymmetricKey_buffer,
            encryptedFile_buffer_result
        )

        // console.log(`decryptedFile: ${decryptedFile}`)
        const fileName = docSnap.data().file_name
        const fileType = docSnap.data().file_type
        downloadBase64File(fileType, decryptedFile, fileName)

        setOpenBackDrop(false)
    }

    function downloadBase64File(contentType, base64Data, fileName) {
        const linkSource = `data:${contentType};base64,${base64Data}`
        const downloadLink = document.createElement("a")
        downloadLink.href = linkSource
        downloadLink.download = fileName
        downloadLink.click()
    }

    return (
        <div>
            <Tooltip
                title={
                    enableConfirmHash
                        ? ""
                        : "You are the owner of this item, or you have not been granted access"
                }
            >
                <div>
                    <Button
                        theme="primary"
                        type="button"
                        text="Confirm Hashes"
                        onClick={handleClickOpenConfirmHash}
                        disabled={!enableConfirmHash}
                    />
                </div>
            </Tooltip>
            <Dialog
                open={openConfirmHash}
                onClose={handleCloseConfirmHash}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Compare Hashes and get the symmetric key"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        By clicking "Confirm", you will send the hash of the encrypted file to the
                        smart contract for comparison.
                    </DialogContentText>
                    <DialogContentText id="alert-dialog-description">
                        If the hashes match with each other, you will get the symmetric key for
                        decryption.
                    </DialogContentText>
                    <div className="flex flex-row justify-start mt-2">
                        <TextField
                            id="standard-read-only-input"
                            className="mr-3"
                            label="IPFS URI"
                            defaultValue=" "
                            InputProps={{
                                readOnly: true,
                            }}
                            variant="standard"
                            fullWidth
                            value={ipfsURI}
                        />
                        <Button
                            theme="secondary"
                            type="button"
                            text="Get IPFS URI"
                            onClick={handleGetIpfsURI}
                            size="small"
                        />
                    </div>
                    <div className="flex flex-row justify-start mt-2">
                        <TextField
                            id="standard-read-only-input"
                            className="mr-3"
                            label="Encrypted IPFS File Hash"
                            defaultValue=" "
                            InputProps={{
                                readOnly: true,
                            }}
                            variant="standard"
                            fullWidth
                            value={encryptedFileHash}
                        />
                        <Button
                            theme="secondary"
                            type="button"
                            text="Get Hash"
                            onClick={handleGetHash}
                            size="small"
                            disabled={!ipfsURI}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button type="button" text="Cancel" onClick={handleCloseConfirmHash} />
                    <Button
                        theme="primary"
                        type="button"
                        text="Confirm"
                        size="large"
                        onClick={handleConfirmHash}
                        disabled={isLoading || isFetching || !ipfsURI || !encryptedFileHash}
                    />
                </DialogActions>
            </Dialog>
            <Snackbar
                open={openConfirmHashSuccessBar}
                autoHideDuration={6000}
                onClose={() => {
                    setOpenConfirmHashSuccessBar(false)
                }}
            >
                <Alert
                    onClose={() => {
                        setOpenConfirmHashSuccessBar(false)
                    }}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Confirm hash successfully!
                </Alert>
            </Snackbar>
        </div>
    )
}

export default ConfirmHashButton
