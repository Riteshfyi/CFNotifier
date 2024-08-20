// App.js
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const registerHandle = async () => {
    if (!handle || !email) {
      setError("Please fill out both fields.");
      return;
    }

    setError(""); 

    try {
      const response = await axios.post("https://cfnotifierapi.vercel.app/check-rating", { handle, email },{
        withCredentials: true,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error registering handle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-black text-center mb-6">
          Codeforces Notifier
        </h1>
        <input
          type="text"
          placeholder="Enter Codeforces Handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className={`w-full px-4 py-2 mb-4 border ${
            error && !handle ? "border-red-500" : "border-blue-300"
          } rounded-lg focus:outline-none focus:${
            error && !handle ? "border-red-500" : "border-blue-500"
          }`}
        />
        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-4 py-2 mb-6 border ${
            error && !email ? "border-red-500" : "border-blue-300"
          } rounded-lg focus:outline-none focus:${
            error && !email ? "border-red-500" : "border-blue-500"
          }`}
        />
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <button
          onClick={registerHandle}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Register
        </button>
        <p className="text-center text-blue-600 mt-4 font-semibold">
          {message}
        </p>
      </div>
    </div>
  );
}

export default App;
