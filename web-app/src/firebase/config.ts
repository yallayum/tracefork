import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCQ1wTNvTSu3qFaHu15-PXfGV4aTAL24bQ',
  authDomain: 'tracefork-3f5ac.firebaseapp.com',
  projectId: 'tracefork-3f5ac',
  storageBucket: 'tracefork-3f5ac.firebasestorage.app',
  messagingSenderId: '1031575348658',
  appId: '1:1031575348658:web:f39a1d7d4d9c47ea9df0ab',
  measurementId: 'G-SC7BM7CFND',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
