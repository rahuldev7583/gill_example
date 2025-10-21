/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useSignTransaction, useSolanaClient } from '@gillsdk/react';
import {
  createTransaction,
  compileTransaction,
  Base64EncodedWireTransaction,
  Transaction,
} from 'gill';
import { getAddMemoInstruction } from 'gill/programs';

export default function TestSignTransaction() {
  const { rpc } = useSolanaClient();
  const { account, signer, mutation } = useSignTransaction();

  const [memoText, setMemoText] = useState('');
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toBase64EncodedWireTransaction(
    bytes: Uint8Array
  ): Base64EncodedWireTransaction {
    const base64 = Buffer.from(bytes).toString('base64');
    return base64 as Base64EncodedWireTransaction;
  }

  const handleSendMemo = async () => {
    if (!account || !signer) {
      setError('Wallet not connected!');
      return;
    }

    if (!memoText.trim()) {
      setError('Please enter a memo message');
      return;
    }

    setError(null);
    setTxSig(null);

    try {
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      const txRaw = createTransaction({
        version: 0,
        feePayer: signer,
        instructions: [getAddMemoInstruction({ memo: memoText })],
        latestBlockhash,
      });

      const tx: Transaction = compileTransaction(txRaw);
      const signedTxBytes = await mutation.mutateAsync(tx);
      const signedTxBase64 = toBase64EncodedWireTransaction(signedTxBytes);

      const response = await rpc
        .sendTransaction(signedTxBase64, {
          encoding: 'base64',
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        })
        .send();

      setTxSig(response);
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
    }
  };

  return (
    <div className='p-4 border rounded-xl max-w-md mx-auto mt-8'>
      <h2 className='text-lg font-bold mb-2'>Send Memo Transaction</h2>

      <input
        type='text'
        className='w-full border px-2 py-1 rounded mb-2'
        placeholder='Enter memo text'
        value={memoText}
        onChange={(e) => setMemoText(e.target.value)}
      />

      <button
        onClick={handleSendMemo}
        disabled={!memoText || mutation.isPending}
        className='px-4 py-2 bg-black text-white rounded-xl cursor-pointer'
      >
        {mutation.isPending ? 'Signing...' : 'Send Memo Txn'}
      </button>

      {txSig && (
        <p className='mt-2 text-green-600'>
          ✅ Success! Tx Signature:{' '}
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target='_blank'
            rel='noreferrer'
            className='underline'
          >
            View on Explorer
          </a>
        </p>
      )}

      {error && <p className='mt-2 text-red-600'>⚠️ {error}</p>}
    </div>
  );
}
