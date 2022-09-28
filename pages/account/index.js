import { collection, getDocs, query, where } from "firebase/firestore"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { useCollection } from "react-firebase-hooks/firestore"

import Header from "../../components/Header"
import { db } from "../../firebase"
import useGlobalState from "../../hooks/useGlobalState"

function purchased() {
    const [accountAddr, setAccountAddr] = useGlobalState("accountAddr")
    const router = useRouter()
    const collectionReference = collection(db, "items_listed")
    const queryGetData = query(collectionReference, where("owner", "==", accountAddr))
    const [dataSnapshot, dataLoading, error] = useCollection(queryGetData)

    return (
        <div>
            <Header />
            <div className="flex flex-col">
                <div>
                    <p className="font-bold text-3xl mx-8 my-8">Your Account</p>
                </div>
                <div className="flex flex-row justify-start mb-3 pb-2 border-b-2">
                    <p
                        className="mx-10 font-semibold text-slate-500 cursor-pointer hover:text-black"
                        onClick={() => {
                            router.push("/account/listed")
                        }}
                    >
                        Your Listed Products
                    </p>
                    <p
                        className="mx-10 font-semibold text-slate-500 cursor-pointer hover:text-black"
                        onClick={() => {
                            router.push("/account/portfolio")
                        }}
                    >
                        Your Portfolio
                    </p>
                    {/* <p
                        className="mx-10 font-semibold text-slate-500 cursor-pointer hover:text-black"
                        onClick={() => {
                            router.push("/account/purchased")
                        }}
                    >
                        Purchased Products
                    </p> */}
                    <p
                        className="mx-10 font-semibold text-slate-500 cursor-pointer  hover:text-black "
                        onClick={() => {
                            router.push("/account/request")
                        }}
                    >
                        Pending Requests
                    </p>
                </div>
            </div>
        </div>
    )
}

export default purchased
