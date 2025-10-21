'use client';

import { useBalance, useSolanaClient, useWallet } from '@gillsdk/react';
import React from 'react';
import TestSignAndSendransaction from './components/SignAndSendTransaction';
import SignMessage from './components/SignMessage';
import SignInTester from './components/Signin';
import TestSignTransaction from './components/SignTransaction';
import TestSignAllTransactions from './components/SignAllTransaction';

const Landing = () => {
  const { account, wallet } = useWallet();
  const { rpc, cluster } = useSolanaClient();

  console.log({ rpc, cluster });

  const { balance } = useBalance({
    address: account?.address,
  });

  return (
    wallet && account && (
      <div className='ml-10 mt-4'>
        <h1 className='text-xl mt-8'>
          Connected to
          <span className='font-bold'> {account?.address}</span>
        </h1>

        <h2 className='font-semibold text-xl'>
          Balance
          <span className='ml-2'>
            {balance ? `${(Number(balance) / 1e9).toFixed(4)} SOL` : '0 SOL'}
          </span>
        </h2>
        <SignInTester/>
        <SignMessage/>
        <TestSignTransaction/>
        <TestSignAndSendransaction/>
        <TestSignAllTransactions/>
      </div>
    )
  );
};

export default Landing;
