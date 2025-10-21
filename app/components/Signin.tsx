/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useWallet, useSignIn } from "@gillsdk/react";
import { verifySignIn } from "@solana/wallet-standard-util";
import React from "react";

export default function SignInTester() {
  const { wallet } = useWallet();

  if (!wallet) return <p>No wallet connected</p>;

  const { mutation } :any= useSignIn(wallet, {
    domain: "localhost:3000",
    statement: "Sign in to Rahul's Dapp",
  });

  const handleSignIn = async () => {
    try {
      const result :any= await mutation.mutateAsync();
      const verified = verifySignIn(
        {
          domain: "localhost:3000",
          statement: "Sign in to Rahul's Dapp",
        },
        result
      );

      console.log("Verification result:", verified);
      alert(verified ? "✅ Sign-in verified" : "❌ Verification failed");
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Sign In Test</h2>

      <button
        disabled={mutation.isPending}
        onClick={handleSignIn}
        className={`px-4 py-2 rounded-lg shadow text-white cursor-pointer ${
          mutation.isPending
            ? "bg-gray-500"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {mutation.isPending ? "Signing In..." : "Test Sign In"}
      </button>

      {mutation.error && (
        <p className="mt-4 text-red-600 font-medium">
          Error: {mutation.error.message}
        </p>
      )}

      {mutation.data && (
        <div className="mt-6 bg-gray-100 text-black rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2">Sign In Result</h3>
           <h3 style={{ fontWeight: "bold" }}>Signature:</h3>
          <p
            style={{
              wordBreak: "break-all",
              backgroundColor: "#f5f5f5",
              padding: "8px",
              borderRadius: "6px",
              fontFamily: "monospace",
            }}
          >
            {Buffer.from(mutation.data.signature).toString("base64")}
          </p>
         
        </div>
      )}
    </section>
  );
}
