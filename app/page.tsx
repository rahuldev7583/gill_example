'use client';

import { GillProvider } from './GillProvider';
import { WalletContextProvider } from '@gillsdk/react';
import { WalletConnectButton } from './WalletConnect';
import Landing from './Landing';


export default function Home() {
  return (
    <div>
      <h1 className='text-2xl mt-4 ml-[40%]'>Solana Wallet Adapter</h1>
      <WalletContextProvider>
        <WalletConnectButton />
        <GillProvider>
          <Landing/>
        </GillProvider>
      </WalletContextProvider>

    </div>
  );
}
