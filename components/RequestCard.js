import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    TextField,
    Backdrop,
    CircularProgress,
} from "@mui/material"
import React, { useState } from "react"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import { red } from "@mui/material/colors"
import GrantAccessButton from "./GrantAccessButton"

function RequestCard({ itemData, itemId }) {
    const [openBackDrop, setOpenBackDrop] = useState(false)

    const handleCloseBackDrop = () => {
        setOpenBackDrop(false)
    }

    return (
        <div className="flex flex-row w-7/12 mx-4 my-2 shadow-md hover:shadow-xl border-gray-50 border-2 h-48">
            <div className="flex flex-col w-1/5 ">
                <img src={itemData.image_url} className="h-40 object-contain p-3" />
                <p className="font-semibold text-sm text-center">{itemData.name}</p>
            </div>
            <div className=" w-4/5 flex flex-col overflow-x-auto">
                {itemData.customers_requesting.map((customer) => {
                    return (
                        <div className="flex flex-row justify-start m-2">
                            <p className="mx-2">
                                Customer{" "}
                                <strong>
                                    {`${customer.slice(0, 6)}...${customer.slice(
                                        customer.length - 4
                                    )}`}{" "}
                                </strong>
                                is requesting access for this item.
                            </p>
                            <GrantAccessButton
                                customerAddr={customer}
                                itemData={itemData}
                                itemId={itemId}
                                setOpenBackDrop={setOpenBackDrop}
                            />
                            {/* <HighlightOffIcon
                                sx={{ color: red[500] }}
                                className="ml-1 cursor-pointer"
                            /> */}
                        </div>
                    )
                })}
            </div>
            <Backdrop
                sx={{ color: "#fff", zIndex: 100 }}
                open={openBackDrop}
                onClick={handleCloseBackDrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    )
}

export default RequestCard
