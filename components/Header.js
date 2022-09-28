import {
    Badge,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import ConnectButton from "./ConnectButton"
import CreateButton from "./CreateButton"
import { useRouter } from "next/router"
import useGlobalState from "../hooks/useGlobalState"

function Header() {
    const [selectedFile, setSelectedFile] = useState()
    const [selectedImage, setSelectedImage] = useState()

    const router = useRouter()

    return (
        <div className="w-full h-14 border-b-gray border-2 shadow-md flex flex-row sticky top-0 z-100 bg-white">
            <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy9oQH2y3Oezc6dgeVucGDhNFuZtxon6WyDdYyRE25UUd2XxWudPQD-38SrGIUwF6o_-E&usqp=CAU"
                className="h-11 mt-1 mx-3 rounded-full cursor-pointer"
                onClick={() => {
                    router.push("/")
                }}
            />
            <div className="flex-1 flex flex-col justify-center mx-6">
                <TextField id="search-bar" label="Search items" variant="outlined" size="small" />
            </div>
            <div className="flex flex-row w-fit  justify-end">
                <Tooltip title="Explore digital assets">
                    <div
                        className="mx-3 flex flex-col justify-center cursor-pointer font-semibold"
                        onClick={() => {
                            router.push("/")
                        }}
                    >
                        Explore
                    </div>
                </Tooltip>
                {/* <Tooltip title="List your digital asset for sale">
                    <div className="mx-3 flex flex-col justify-center cursor-pointer font-semibold">
                        <CreateButton />
                    </div>
                </Tooltip> */}
                <Tooltip title="Your account">
                    <div
                        className="mx-3 flex flex-col justify-center cursor-pointer font-semibold"
                        onClick={() => {
                            router.push(`/account/listed`)
                        }}
                    >
                        Account
                    </div>
                </Tooltip>
                {/* <Tooltip title="Notification">
                    <div className="mx-3 flex flex-col justify-center cursor-pointer font-semibold">
                        <Badge badgeContent={4} color="primary">
                            <NotificationsNoneIcon color="action" />
                        </Badge>
                    </div>
                </Tooltip> */}
                <Tooltip title="Your Wallet">
                    <div className="mx-4 flex flex-col justify-center">
                        <ConnectButton />
                    </div>
                </Tooltip>
            </div>
        </div>
    )
}

export default Header
