"use client";
import React, { useState } from "react";
import { useSignMessage, useWallet, WalletAccount } from "@gillsdk/react";

const SignMessage = () => {
  const { account } = useWallet();
  const [message, setMessage] = useState("");

  const { signMessage, isPending, data } = useSignMessage({
    config: {
      account: account as WalletAccount,
      message: new TextEncoder().encode(message),
    },
  });

  async function handleClick() {
    try {
      const result = await signMessage();
      console.log(
        "Signature:",
        Buffer.from(result.signature).toString("base64"),
      );
    } catch (err) {
      console.error("Error signing:", err);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
      }}
    >
      <textarea
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          fontFamily: "monospace",
          minHeight: "80px",
        }}
        placeholder="Enter message to sign"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "10px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: !message || !account || isPending ? 0.6 : 1,
        }}
        onClick={handleClick}
        disabled={!message || !account || isPending}
      >
        {isPending ? "Signing..." : "Sign Message"}
      </button>

      {data && (
        <div style={{ marginTop: "16px" }}>
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
            {Buffer.from(data.signature).toString("base64")}
          </p>
        </div>
      )}
    </div>
  );
};

export default SignMessage;