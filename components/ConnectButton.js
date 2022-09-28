import React, { useEffect, useState } from "react"
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined"
import { useMoralis } from "react-moralis"
import Drawer from "@mui/material/Drawer"

function ConnectButton() {
    const [drawerState, setDrawerState] = useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    })

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return
        }

        setDrawerState({ ...drawerState, [anchor]: open })
    }

    const anchor = "right"

    const {
        enableWeb3,
        isWeb3Enabled,
        isWeb3EnableLoading,
        account,
        Moralis,
        deactivateWeb3,
        authenticate,
        isAuthenticated,
    } = useMoralis()

    useEffect(() => {
        if (
            !isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            enableWeb3()
            // enableWeb3({provider: window.localStorage.getItem("connected")}) // add walletconnect
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null Account found")
            }
        })
    }, [])

    const connectWeb3 = async () => {
        await enableWeb3()
        if (typeof window !== "undefined") {
            window.localStorage.setItem("connected", "injected")
        }
        if (!isAuthenticated) {
            await authenticate()
        }
    }

    return (
        <div>
            {account ? (
                <div>
                    <AccountBalanceWalletOutlinedIcon
                        color="action"
                        onClick={toggleDrawer(anchor, true)}
                    />
                    <Drawer
                        anchor={anchor}
                        open={drawerState[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                    >
                        <div>User Wallet Information</div>
                    </Drawer>
                </div>
            ) : (
                <AccountBalanceWalletOutlinedIcon
                    color="action"
                    disabled={isWeb3EnableLoading}
                    onClick={connectWeb3}
                />
            )}
        </div>
    )
}

export default ConnectButton
