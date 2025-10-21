/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useSignAndSendTransaction, useSolanaClient } from '@gillsdk/react';
import {
  createTransaction,
  compileTransaction,
  Transaction,
} from 'gill';
import { getAddMemoInstruction } from 'gill/programs';

export default function TestSignAndSendransaction() {
  const { rpc } = useSolanaClient();
  const { account, signer, mutation } = useSignAndSendTransaction();

  const [memoText, setMemoText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendMemo = async () => {
    if (!account || !signer) {
      setError('Wallet not connected!');
      return;
    }

    if (!memoText.trim()) {
      setError('Please enter a memo message');
      return;
    }

    try {
      setError(null);

      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      const txRaw = createTransaction({
        version: 0,
        feePayer: signer,
        instructions: [getAddMemoInstruction({ memo: memoText })],
        latestBlockhash,
      });

      const tx: Transaction = compileTransaction(txRaw);
      await mutation.mutateAsync(tx);
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
    }
  };

  return (
    <div className="p-4 border rounded-xl max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2">Sign & Send Memo Transaction</h2>

      <input
        type="text"
        className="w-full border px-2 py-1 rounded mb-2"
        placeholder="Enter memo text"
        value={memoText}
        onChange={(e) => setMemoText(e.target.value)}
      />

      <button
        onClick={handleSendMemo}
        disabled={!memoText || mutation.isPending}
        className="px-4 py-2 bg-black text-white rounded-xl cursor-pointer"
      >
        {mutation.isPending ? 'Sending...' : 'Send Memo Txn'}
      </button>

      {mutation.data && (
        <p className="mt-2 text-green-600">
          ✅ Success! Tx Signature:{' '}
          <a
            href={`https://explorer.solana.com/tx/${mutation.data}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View on Explorer
          </a>
        </p>
      )}

      {(error || mutation.error) && (
        <p className="mt-2 text-red-600">
          ⚠️ {error || mutation.error?.message}
        </p>
      )}
    </div>
  );
}
