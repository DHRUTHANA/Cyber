import React, { useState } from "react";
import { auth, provider, signInWithPopup, signOut } from "./firebaseConfig";
import axios from "axios";
import * as openpgp from "openpgp";
import "./App.css";
import loginBg from "./assets/login-bg.png";

function App() {
  const [user, setUser] = useState(null);
  const [emailContent, setEmailContent] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");

  const handleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  const encryptMessage = async () => {
    const publicKeyArmored = await axios.get("http://localhost:5000/get-public-key"); // Fetch public key
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored.data });
    console.log("Fetched Public Key:", publicKeyArmored);


    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: emailContent }),
      encryptionKeys: publicKey
    });

    setEncryptedMessage(encrypted);
  };

  return (
<div className={user ? "dashboard" : "login"}>
      {user ? (
        <div className="dashboard-content">
          <h2>Welcome, {user.displayName}</h2>
          <button onClick={handleLogout}>Logout</button>
          <textarea onChange={(e) => setEmailContent(e.target.value)} placeholder="Enter your message" />
          <button onClick={encryptMessage}>Encrypt</button>
          {encryptedMessage && <textarea value={encryptedMessage} readOnly />}
        </div>
      ) : (
        <div className="login-content">
          <button onClick={handleLogin}>Login with Google</button>
        </div>
      )}
    </div>
  );
}



export default App;
