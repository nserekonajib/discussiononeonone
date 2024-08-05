// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmG5i0rbS8msYwJ3FbB1s_0cLLCQdNTKA",
    authDomain: "cparesources-63f0e.firebaseapp.com",
    databaseURL: "https://cparesources-63f0e-default-rtdb.firebaseio.com",
    projectId: "cparesources-63f0e",
    storageBucket: "cparesources-63f0e.appspot.com",
    messagingSenderId: "855764095856",
    appId: "1:855764095856:web:211f70f7db6425d638b5b5"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();
  