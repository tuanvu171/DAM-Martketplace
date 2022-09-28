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
    Tooltip,
} from "@mui/material"
import { Button } from "@web3uikit/core"
import { useEffect, useState } from "react"
import abi from "../../constants/abi"
import { db } from "../../firebase"
import { addDoc, collection, doc, getDoc, setDoc, updateDoc, where } from "firebase/firestore"
import { Moralis } from "moralis"
import { bufferToHex } from "ethereumjs-util"
import { Transaction } from "ethereumjs-tx"
import getSignedTransaction from "../../utils/getSignedTransaction"

function BuyButton({ smartContractAddress, itemPrice, itemId, enableBuy, setOpenBackDrop }) {
    const { account } = useMoralis()
    const [openBuy, setOpenBuy] = useState(false)
    const [openBuySuccessBar, setOpenBuySuccessBar] = useState(false)

    const handleClickOpenBuy = () => {
        setOpenBuy(true)
    }

    const handleCloseBuy = () => {
        setOpenBuy(false)
    }

    const {
        runContractFunction: registerRequest,
        isFetching,
        isLoading,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "registerRequest",
        msgValue: Moralis.Units.ETH(itemPrice.toString()),
        params: {},
    })

    const handleRegisterRequest = async () => {
        setOpenBackDrop(true)
        await registerRequest({
            onSuccess: handleSuccessRegister,
            onError: (error) => {
                console.log(error)
                setOpenBackDrop(false)
            },
        })

        setOpenBuy(false)
    }

    const handleSuccessRegister = async (tx) => {
        const txReceipt = await tx.wait(1)

        // update item's attribute: customers_requesting
        const documentReference = doc(db, "items_listed", itemId)
        const docSnap = await getDoc(documentReference)
        if (docSnap.exists()) {
            let customersRequestingList = docSnap.data().customers_requesting
            if (!customersRequestingList) {
                customersRequestingList = [account]
            } else {
                customersRequestingList.push(account)
            }
            await updateDoc(documentReference, {
                customers_requesting: customersRequestingList,
            })
        }

        // // get customer's public key
        // const nonce = tx.nonce.toString()
        // const gasPrice = tx.gasPrice.toString()
        // const gasLimit = tx.gasLimit.toString()
        // const to = tx.to.toString()
        // const value = tx.value.toString()
        // const data = tx.data.toString()
        // console.log(tx)
        // console.log(`nonce:${nonce}`)
        // console.log(`gasPrice:${gasPrice}`)
        // console.log(`gasLimit:${gasLimit}`)
        // console.log(`to:${to}`)
        // console.log(`value:${value}`)
        // console.log(`data:${data}`)
        // const signedTx = getSignedTransaction(nonce, gasPrice, gasLimit, to, value, data)
        // const txRecover = new Transaction(signedTx)
        // // const address = bufferToHex(tx.getSenderAddress())
        // const publicKey = bufferToHex(txRecover.getSenderPublicKey())
        // // add customer's public key
        // const customerDocumentReference = doc(db, "customers", account)
        // await setDoc(customerDocumentReference, {
        //     public_key: publicKey,
        // })

        setOpenBackDrop(false)
        setOpenBuySuccessBar(true)
    }

    return (
        <div>
            <Tooltip
                title={
                    enableBuy
                        ? ""
                        : "You are the owner of this item, or you have already requested for it"
                }
            >
                <div>
                    <Button
                        theme="primary"
                        type="button"
                        text="Buy Product"
                        onClick={handleClickOpenBuy}
                        disabled={!enableBuy}
                    />
                </div>
            </Tooltip>

            <Dialog
                open={openBuy}
                onClose={handleCloseBuy}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"You want to buy this product?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        By clicking "Confirm", you will send a register request to the content
                        owner and wait for his/her granting. You can download the product only when
                        the content owner accept your request.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="button"
                        text="Cancel"
                        onClick={handleCloseBuy}
                        disabled={isFetching || isLoading}
                    />
                    <Button
                        theme="primary"
                        type="button"
                        text="Confirm"
                        size="large"
                        onClick={handleRegisterRequest}
                        disabled={isFetching || isLoading}
                    />
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openBuySuccessBar}
                autoHideDuration={6000}
                onClose={() => {
                    setOpenBuySuccessBar(false)
                }}
            >
                <Alert
                    onClose={() => {
                        setOpenBuySuccessBar(false)
                    }}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Request successfully!
                </Alert>
            </Snackbar>
        </div>
    )
}

export default BuyButton
