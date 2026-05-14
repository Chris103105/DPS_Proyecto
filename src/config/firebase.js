// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de tu proyecto Perla Negra
const firebaseConfig = {
  apiKey: "AIzaSyDky9Vqtpv58wWrze-VK0sqk40pp8L-7Ls",
  authDomain: "perla-000000.firebaseapp.com",
  projectId: "perla-000000",
  storageBucket: "perla-000000.firebasestorage.app",
  messagingSenderId: "454912125495",
  appId: "1:454912125495:web:8e5089dfd97fa10015adb2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios para usarlos en el resto de la aplicación
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);