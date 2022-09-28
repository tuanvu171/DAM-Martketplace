import * as React from "react"
import { useMoralis } from "react-moralis"
import { Backdrop, CircularProgress } from "@mui/material"
import { useState } from "react"
import BuyButton from "./ItemCardButtons/BuyButton"
import CancelRequestButton from "./ItemCardButtons/CancelRequestButton"
import ConfirmHashButton from "./ItemCardButtons/ConfirmHashButton"
import WithdrawFund from "./ItemCardButtons/WithdrawFund"

export default function ItemCard({ itemData, itemId }) {
    const { account } = useMoralis()

    const [openBackDrop, setOpenBackDrop] = useState(false)

    const enableBuy =
        account != itemData.owner &&
        (!itemData.customers_requesting || !itemData.customers_requesting.includes(account)) &&
        (!itemData.customers_granting || !itemData.customers_granting.includes(account))
    const enableCancel =
        account != itemData.owner &&
        (itemData.customers_requesting ? itemData.customers_requesting.includes(account) : false)
    const enableConfirmHash =
        account != itemData.owner &&
        (itemData.customers_granting ? itemData.customers_granting.includes(account) : false)

    const handleCloseBackDrop = () => {
        setOpenBackDrop(false)
    }

    return (
        <div className="flex flex-col w-11/12 rounded-lg border-gray-50 border-2 shadow-md cursor-pointer hover:shadow-xl">
            <div className=" flex flex-col justify-center border-b-2">
                <img src={itemData.image_url} className="h-48 object-contain p-3" />
                <p className="font-semibold text-center text-lg">{itemData.name}</p>
            </div>
            <div className="flex flex-row my-2 h-8">
                <div className="flex justify-evenly w-full mx-2 gap-2">
                    <BuyButton
                        smartContractAddress={itemData.contract_address}
                        itemPrice={itemData.price}
                        enableBuy={enableBuy}
                        setOpenBackDrop={setOpenBackDrop}
                        itemId={itemId}
                    />
                    <CancelRequestButton
                        smartContractAddress={itemData.contract_address}
                        enableCancel={enableCancel}
                        setOpenBackDrop={setOpenBackDrop}
                        itemId={itemId}
                    />
                    <ConfirmHashButton
                        enableConfirmHash={enableConfirmHash}
                        smartContractAddress={itemData.contract_address}
                        setOpenBackDrop={setOpenBackDrop}
                        itemId={itemId}
                    />
                    <WithdrawFund
                        smartContractAddress={itemData.contract_address}
                        enableCancel={enableCancel}
                        setOpenBackDrop={setOpenBackDrop}
                        itemId={itemId}
                    />
                </div>
            </div>
            <Backdrop
                sx={{ color: "#fff", zIndex: 100 }}
                open={openBackDrop}
                onClick={handleCloseBackDrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <div className="h-8 flex flex-col justify-center ml-2">
                <p className="font-semibold mx-2">
                    Owner:{" "}
                    {!account
                        ? `${itemData.owner.slice(0, 6)}...${itemData.owner.slice(
                              itemData.owner.length - 4
                          )}`
                        : itemData.owner == account
                        ? "You"
                        : `${itemData.owner.slice(0, 6)}...${itemData.owner.slice(
                              itemData.owner.length - 4
                          )}`}
                </p>
            </div>
            <div className="h-16 flex flex-col justify-top ml-2">
                <p className="font-semibold text-sm mx-2">Price: {itemData.price} ETH</p>
                <p className="font-semibold text-sm mx-2">Description: {itemData.description}</p>
            </div>
        </div>
    )
}
