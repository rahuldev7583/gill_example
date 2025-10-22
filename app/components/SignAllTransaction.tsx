/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  createTransaction,
  compileTransaction,
  Base64EncodedWireTransaction,
  address,
} from 'gill';
import { getAddMemoInstruction, getTransferSolInstruction } from 'gill/programs';
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

  const handleSendTransactions = async () => {
  if (!account || !signer) {
    setError('Wallet not connected!');
    return;
  }
  if (!memoText.trim()) {
    setError('Please enter a memo message');
    return;
  }

  if (isLoading) {
    return;
  }

  try {
    setIsLoading(true);
    setError(null);
    setTxSigs([]);

    await new Promise(resolve => setTimeout(resolve, 100));
    const blockhash1Response = await rpc.getLatestBlockhash().send();

    await new Promise(resolve => setTimeout(resolve, 500));

    const blockhash2Response = await rpc.getLatestBlockhash().send();

    const blockhash1 = blockhash1Response.value;
    const blockhash2 = blockhash2Response.value;

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const memoTx = compileTransaction(
      createTransaction({
        version: 0,
        feePayer: signer,
        instructions: [
          getAddMemoInstruction({ 
            memo: `${memoText} - ${uniqueId}` 
          }),
        ],
        latestBlockhash: blockhash1,
      })
    );

    const transferTx = compileTransaction(
      createTransaction({
        version: 0,
        feePayer: signer,
        instructions: [
          getTransferSolInstruction({
            source: signer,
            destination: address("4rtVJj7bkYHtgGnF9GpxpygYGwYbpyoefdXpV6fsZPGH"),
            amount: 10000000n,
          }),
        ],
        latestBlockhash: blockhash2,
      })
    );

    const txs = [memoTx, transferTx];
    const signedTxBytesArray = await signAllTransaction(txs);
    const base64Txs = signedTxBytesArray.map(toBase64EncodedWireTransaction);

    const sendResults = await Promise.allSettled(
      base64Txs.map((tx, idx) =>
        rpc
          .sendTransaction(tx, {
            encoding: 'base64',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
          .send()
          .catch(err => {
            console.error(`Tx #${idx + 1} send error:`, err);
            throw err;
          })
      )
    );

    const successfulSigs: string[] = [];
    sendResults.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        successfulSigs.push(result.value);
        console.log(`✅ Tx #${idx + 1} succeeded: ${result.value}`);
      } else {
        console.error(`❌ Transaction #${idx + 1} failed:`, result.reason);
      }
    });

    if (successfulSigs.length > 0) {
      setTxSigs(successfulSigs);
    } else {
      setError('All transactions failed. Check console for details.');
    }
  } catch (err: any) {
    console.error('Transaction process failed:', err);
    setError(err.message || 'Transaction failed');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="p-4 border rounded-xl max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2">Test Sign All Transactions Hook</h2>

      <input
        type="text"
        className="w-full border px-2 py-1 rounded mb-2"
        placeholder="Enter memo text"
        value={memoText}
        onChange={(e) => setMemoText(e.target.value)}
      />

      <button
        onClick={handleSendTransactions}
        disabled={!memoText || isLoading}
        className="px-4 py-2 bg-black text-white rounded-xl cursor-pointer"
      >
        {isLoading ? 'Sending...' : 'Send 2 Transactions'}
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
                  Tx #{i + 1} - View on Explorer
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
