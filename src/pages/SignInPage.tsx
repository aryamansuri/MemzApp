import React, { useState } from "react";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import { allowedEmails } from "../allowedEmails";

export default function SignInPage({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowedEmails.includes(email)) {
      setError("This email is not allowed.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSignIn();
    } catch (err: any) {
      setError(err.message);
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background">
      <form onSubmit={handleEmailSignIn} className="bg-card p-8 rounded shadow w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input input-bordered"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input input-bordered"
          required
        />
        <button type="submit" className="btn btn-primary w-full">Sign in with Email</button>
        {/* Google sign-in removed */}
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
}
