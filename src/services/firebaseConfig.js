// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - substitua pelas suas credenciais
const firebaseConfig = {
  apiKey: "AIzaSyAN23m2IbU2r0RHETvJ0HYkER4XivSlDek",
  authDomain: "meu-mercadinho-20e7e.firebaseapp.com",
  projectId: "meu-mercadinho-20e7e",
  storageBucket: "meu-mercadinho-20e7e.firebasestorage.app",
  messagingSenderId: "838135941633",
  appId: "1:838135941633:web:a354b798145d3becfd8e00",
  measurementId: "G-XGW3PPG40L"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

export default app;
