import React from "react"
import { useWeb3Contract } from "react-moralis"
import {
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
} from "@mui/material"
import { Button } from "@web3uikit/core"
import { useEffect, useState } from "react"
import abi from "../../constants/abi"

function WithdrawFund({ smartContractAddress, setOpenBackDrop }) {
    const [openWithdraw, setOpenWithdraw] = useState(false)
    const [openWithdrawSuccessBar, setOpenWithdrawSuccessBar] = useState(false)
    const [withdrawableFund, setWithdrawableFund] = useState()

    const handleClickOpenWithdraw = () => {
        getAmount()
        setOpenWithdraw(true)
    }

    const handleCloseWithdraw = () => {
        setOpenWithdraw(false)
    }

    const { runContractFunction: getWithdrawableFund } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "getWithdrawableFund",
        params: {},
    })

    const getAmount = async () => {
        const withdrawableFundGet = await getWithdrawableFund()
        console.log(withdrawableFundGet)
        setWithdrawableFund((parseInt(withdrawableFundGet) / 1000000000000000000).toString())
    }

    const { runContractFunction: withdrawFund } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "withdrawFund",
        params: {},
    })

    const handleConfirmWithdraw = async () => {
        setOpenBackDrop(true)
        setOpenWithdraw(false)
        await withdrawFund({
            onSuccess: async (tx) => {
                await tx.wait(1)
                setOpenBackDrop(false)
            },
            onError: (error) => {
                setOpenBackDrop(false)
                console.log(error)
            },
        })

        getAmount()
        setOpenWithdraw(false)
    }

    return (
        <div>
            <div className="ml-1">
                <Button
                    theme="primary"
                    type="button"
                    text="Withdraw Funds"
                    onClick={handleClickOpenWithdraw}
                />
            </div>

            <Dialog
                open={openWithdraw}
                onClose={handleCloseWithdraw}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Withdraw funds from the smart contract"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        By clicking "Confirm", you will send a request to the smart contract to
                        withdraw all funds you have in the contract.
                    </DialogContentText>
                    <div className="flex">
                        <p className="font-semibold mr-3">
                            Your current withdrawable funds:{" "}
                            {withdrawableFund ? withdrawableFund : "0"} ETH
                        </p>
                        <Button
                            theme="secondary"
                            type="button"
                            text="Refresh"
                            onClick={getAmount}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button type="button" text="Cancel" onClick={handleCloseWithdraw} />
                    <Button
                        theme="primary"
                        type="button"
                        text="Confirm"
                        size="large"
                        onClick={handleConfirmWithdraw}
                        disabled={withdrawableFund ? withdrawableFund.toString() == "0" : true}
                    />
                </DialogActions>
            </Dialog>
            <Snackbar
                open={openWithdrawSuccessBar}
                autoHideDuration={6000}
                onClose={() => {
                    setOpenWithdrawSuccessBar(false)
                }}
            >
                <Alert
                    onClose={() => {
                        setOpenWithdrawSuccessBar(false)
                    }}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Withdraw funds successfully!
                </Alert>
            </Snackbar>
        </div>
    )
}

export default WithdrawFund
