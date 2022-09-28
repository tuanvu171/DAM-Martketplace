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
import removeItemOnce from "../../utils/removeItemOnce"

function CancelRequestButton({ smartContractAddress, itemId, enableCancel, setOpenBackDrop }) {
    const { account } = useMoralis()
    const [openCancel, setOpenCancel] = useState(false)
    const [openCancelSuccessBar, setOpenCancelSuccessBar] = useState(false)

    const handleClickOpenCancel = () => {
        setOpenCancel(true)
    }

    const handleCloseCancel = () => {
        setOpenCancel(false)
    }

    const {
        runContractFunction: cancelRequest,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "cancelRequest",
        params: {},
    })

    const handleConfirmCancel = async () => {
        setOpenBackDrop(true)
        await cancelRequest({
            onSuccess: handleSuccessCancel,
            onError: (error) => {
                setOpenBackDrop(false)
                console.log(error)
            },
        })

        setOpenCancel(false)
    }

    const handleSuccessCancel = async (tx) => {
        const txReceipt = await tx.wait(6)

        // delete request from the database
        const documentReference = doc(db, "items_listed", itemId)
        const docSnap = await getDoc(documentReference)
        if (docSnap.exists()) {
            const customersRequestingList = docSnap.data().customers_requesting
            const updatedRequestingList = removeItemOnce(customersRequestingList, account)
            await updateDoc(documentReference, {
                customers_requesting: updatedRequestingList,
            })
        }

        setOpenBackDrop(false)
        setOpenCancelSuccessBar(true)
    }

    return (
        <div>
            <Tooltip
                title={
                    enableCancel
                        ? ""
                        : "You have not register for this item, or the access has already been granted"
                }
            >
                <div className="ml-1">
                    <Button
                        theme="primary"
                        type="button"
                        text="Cancel Request"
                        onClick={handleClickOpenCancel}
                        disabled={!enableCancel}
                    />
                </div>
            </Tooltip>
            <Dialog
                open={openCancel}
                onClose={handleCloseCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"You want to cancel requesting this product?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        By clicking "Confirm", you will cancel the request for accessing the
                        product. Your fund will be transfered back to your account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="button"
                        text="Cancel"
                        onClick={handleCloseCancel}
                        disabled={isLoading || isFetching}
                    />
                    <Button
                        theme="primary"
                        type="button"
                        text="Confirm"
                        size="large"
                        onClick={handleConfirmCancel}
                        disabled={isLoading || isFetching}
                    />
                </DialogActions>
            </Dialog>
            <Snackbar
                open={openCancelSuccessBar}
                autoHideDuration={6000}
                onClose={() => {
                    setOpenCancelSuccessBar(false)
                }}
            >
                <Alert
                    onClose={() => {
                        setOpenCancelSuccessBar(false)
                    }}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Cancel item successfully!
                </Alert>
            </Snackbar>
        </div>
    )
}

export default CancelRequestButton
