import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyCwlpiP0Bl8-gGlg1RB7q5Ml8uF5pzQjbA",
    authDomain: "digital-asset-management-caf49.firebaseapp.com",
    projectId: "digital-asset-management-caf49",
    storageBucket: "digital-asset-management-caf49.appspot.com",
    messagingSenderId: "892090425099",
    appId: "1:892090425099:web:f22b799451c72636a14c0e",
    measurementId: "G-RP0VHBHP22",
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

const storage = getStorage(app)

export { db, storage }
