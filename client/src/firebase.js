// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPRRxkA_7K47yhdfaBeJqcH-tzOHQ2uOg",
  authDomain: "codecase-ea14b.firebaseapp.com",
  projectId: "codecase-ea14b",
  storageBucket: "codecase-ea14b.firebasestorage.app",
  messagingSenderId: "442243751555",
  appId: "1:442243751555:web:974534b2cb34a3353a05b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };