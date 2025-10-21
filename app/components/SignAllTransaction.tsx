/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  createTransaction,
  compileTransaction,
  Base64EncodedWireTransaction,
} from 'gill';
import { getAddMemoInstruction } from 'gill/programs';
import { useSignAllTransaction, useSolanaClient } from '@gillsdk/react';

export default function TestSignAllTransactions() {
  const { rpc } = useSolanaClient();
  const { account, signAllTransaction, signer } = useSignAllTransaction();

  const [memoText, setMemoText] = useState('');
  const [txSigs, setTxSigs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toBase64EncodedWireTransaction(
    bytes: Uint8Array
  ): Base64EncodedWireTransaction {
    return Buffer.from(bytes).toString('base64') as Base64EncodedWireTransaction;
  }

  const handleSendMemos = async () => {
    if (!account || !signer) {
      setError('Wallet not connected!');
      return;
    }
    if (!memoText.trim()) {
      setError('Please enter a memo message');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setTxSigs([]);

      const signedTxs: Uint8Array[] = [];

      for (let i = 0; i < 3; i++) {
        const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

        const tx = compileTransaction(
          createTransaction({
            version: 0,
            feePayer: signer,
            instructions: [getAddMemoInstruction({ memo: `${memoText} #${i + 1}` })],
            latestBlockhash,
          })
        );

        const [signedTx] = await signAllTransaction([tx]);
        signedTxs.push(signedTx);
      }

      const base64Txs = signedTxs.map(toBase64EncodedWireTransaction);

      const sendResults = await Promise.allSettled(
        base64Txs.map((tx) =>
          rpc
            .sendTransaction(tx, {
              encoding: 'base64',
              preflightCommitment: 'confirmed',
              skipPreflight: false,
            })
            .send()
        )
      );

      const successfulSigs: string[] = [];
      sendResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          successfulSigs.push(result.value);
        } else {
          console.error(`Transaction #${idx + 1} failed:`, result.reason);
        }
      });

      setTxSigs(successfulSigs);
    } catch (err: any) {
      console.error('Transaction process failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2">Send Multiple Memo Transactions</h2>

      <input
        type="text"
        className="w-full border px-2 py-1 rounded mb-2"
        placeholder="Enter memo text"
        value={memoText}
        onChange={(e) => setMemoText(e.target.value)}
      />

      <button
        onClick={handleSendMemos}
        disabled={!memoText || isLoading}
        className="px-4 py-2 bg-black text-white rounded-xl cursor-pointer"
      >
        {isLoading ? 'Sending...' : 'Send Memos'}
      </button>

      {txSigs.length > 0 && (
        <div className="mt-2 text-green-600">
          ✅ Success! Tx Signatures:
          <ul>
            {txSigs.map((sig, i) => (
              <li key={i}>
                <a
                  href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                   View on Explorer
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-2 text-red-600">⚠️ {error}</p>}
    </div>
  );
}
