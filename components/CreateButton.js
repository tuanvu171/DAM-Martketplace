import {
    Alert,
    Backdrop,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { db, storage } from "../firebase"
import { getDownloadURL, ref, uploadString } from "firebase/storage"
import { useCollection } from "react-firebase-hooks/firestore"
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore"
import abi from "../constants/abi"
import itemCategories from "../constants/itemCategories"
import useGlobalState from "../hooks/useGlobalState"
import AddIcon from "@mui/icons-material/Add"
import Moralis from "moralis"

function CreateButton() {
    const [openNewItem, setOpenNewItem] = useState(false)
    const [itemPrice, setItemPrice] = useState()
    const [itemName, setItemName] = useState()
    const [itemDescription, setItemDescription] = useState()
    const [smartContractAddress, setSmartContractAddress] = useState()
    const [itemCategory, setItemCategory] = useState()
    const [selectedFile, setSelectedFile] = useState()
    const [selectedImage, setSelectedImage] = useState()
    const [backDrop, setBackDrop] = useState(false)
    const [openSuccessBar, setOpenSuccessBar] = useState(false)
    const { account } = useMoralis()

    const changeHandlerImage = (event) => {
        setSelectedImage(event.target.files[0])
    }

    const changeHandlerFile = (event) => {
        setSelectedFile(event.target.files[0])
    }

    const listNewItem = () => {
        setOpenNewItem(true)
    }

    const handleCloseNewItem = () => {
        setOpenNewItem(false)
        setItemCategory("")
        setSelectedImage(null)
        setSelectedFile(null)
        setItemName("")
        setItemPrice("")
        setItemDescription("")
        setSmartContractAddress("")
    }

    const handleItemDescription = (event) => {
        setItemDescription(event.target.value)
    }

    const handleItemName = (event) => {
        setItemName(event.target.value)
    }

    const handleItemCategory = (event) => {
        setItemCategory(event.target.value)
    }

    const handleItemPrice = (event) => {
        setItemPrice(event.target.value)
    }

    const handleSmartContractAddress = (event) => {
        setSmartContractAddress(event.target.value)
    }

    const fileToBase64 = async (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            // reader.readAsDataURL(file);
            // reader.onload = () => resolve(reader.result);
            reader.readAsBinaryString(file)
            reader.onload = () => resolve(btoa(reader.result))
            reader.onerror = (e) => reject(e)
        })

    const {
        runContractFunction: updatePrice,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: smartContractAddress,
        functionName: "updatePrice",
        params: { newPrice: itemPrice ? Moralis.Units.ETH(itemPrice.toString()) : null },
    })

    const handleCreateNewItem = async (event) => {
        // const imageUrl = await fileToBase64(selectedFile)
        // console.log(selectedFile)
        // downloadBase64File(selectedFile.type, imageUrl, selectedFile.name)
        setBackDrop(true)
        // Update item's price to the smart contract
        await updatePrice({
            onSuccess: async () => {
                // Upload source file and description image to firebase storage
                const imageUrl = await fileToBase64(selectedImage)
                const imageLoc = `/images/${account}/${selectedImage.name}`
                const imageStorageRef = ref(storage, imageLoc)
                await uploadString(imageStorageRef, imageUrl, "base64")

                const fileUrl = await fileToBase64(selectedFile)
                const fileLoc = `/files/${account}/${selectedFile.name}`
                const fileStorageRef = ref(storage, fileLoc)
                await uploadString(fileStorageRef, fileUrl, "base64")

                // Store item information into firestore
                const imageStorageUrl = await getDownloadURL(imageStorageRef)
                const fileStorageUrl = await getDownloadURL(fileStorageRef)

                const collectionReference = collection(db, "items_listed")
                const dataToStore = {
                    owner: account,
                    name: itemName,
                    price: itemPrice ? itemPrice.toString() : null,
                    category: itemCategory,
                    description: itemDescription,
                    contract_address: smartContractAddress,
                    image_url: imageStorageUrl,
                    src_file_url: fileStorageUrl,
                    file_name: selectedFile.name,
                    file_type: selectedFile.type,
                }

                await addDoc(collectionReference, dataToStore)
            },
            onError: (error) => console.log(error),
        })

        // front-end interaction
        setBackDrop(false)
        setOpenSuccessBar(true)
        handleCloseNewItem()
    }

    return (
        <div>
            <Fab
                onClick={listNewItem}
                variant="extended"
                color="primary"
                aria-label="add"
                className=" bg-blue-600"
            >
                <AddIcon sx={{ mr: 1 }} />
                Add new item
            </Fab>

            <Dialog open={openNewItem} onClose={handleCloseNewItem}>
                <DialogTitle>List your item to sell on the Marketplace</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You must enter information of the item that you want to list.
                    </DialogContentText>
                    <Stack direction="column" alignItems="start" spacing={2}>
                        <div className="flex flex-row mt-2">
                            <Button variant="contained" component="label">
                                Upload image
                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    name="imageFile"
                                    onChange={changeHandlerImage}
                                />
                            </Button>
                            <p className="mx-2 font-semibold">
                                {selectedImage ? selectedImage.name : ""}
                            </p>
                        </div>
                        <div className="flex flex-row">
                            <Button variant="contained" component="label">
                                Upload source file
                                <input
                                    hidden
                                    type="file"
                                    name="srcFile"
                                    onChange={changeHandlerFile}
                                />
                            </Button>
                            <p className="mx-2 font-semibold">
                                {selectedFile ? selectedFile.name : ""}
                            </p>
                        </div>
                    </Stack>
                    <FormControl variant="standard" fullWidth className="mt-3">
                        <InputLabel>Item Category</InputLabel>
                        <Select value={itemCategory} onChange={handleItemCategory}>
                            {/* <MenuItem value={"Metaverse Item"}>Metaverse Item</MenuItem>
                            <MenuItem value={"Metaverse Avatar"}>Metaverse Avatar</MenuItem> */}
                            {itemCategories.map((category) => {
                                return (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        label="Item Name"
                        margin="dense"
                        fullWidth
                        variant="standard"
                        onChange={handleItemName}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Item Price (ETH)"
                        type="Number"
                        fullWidth
                        variant="standard"
                        onChange={handleItemPrice}
                    />
                    <TextField
                        autoFocus
                        label="Item Description"
                        margin="dense"
                        fullWidth
                        variant="standard"
                        onChange={handleItemDescription}
                    />
                    <TextField
                        autoFocus
                        label="Smart Contract Address"
                        margin="dense"
                        fullWidth
                        variant="standard"
                        onChange={handleSmartContractAddress}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewItem} disabled={isLoading || isFetching}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateNewItem} disabled={isLoading || isFetching}>
                        Create
                    </Button>
                    <Backdrop
                        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={backDrop}
                        onClick={() => {
                            setBackDrop(false)
                        }}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    <Snackbar
                        open={openSuccessBar}
                        autoHideDuration={6000}
                        onClose={() => {
                            setOpenSuccessBar(false)
                        }}
                    >
                        <Alert
                            onClose={() => {
                                setOpenSuccessBar(false)
                            }}
                            severity="success"
                            sx={{ width: "100%" }}
                        >
                            Upload item successfully!
                        </Alert>
                    </Snackbar>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default CreateButton
