import { useWallet } from '@gillsdk/react';

export function WalletConnectButton() {
  const { wallet, wallets, connect, disconnect, status } = useWallet();

  if (wallet) {
    return (
      <button
        className='bg-black text-white px-3 py-2 rounded-xl  ml-[40%] mt-8'
        onClick={() => disconnect(wallet)}
        disabled={status === 'disconnecting'}
      >
        Disconnect {wallet.name}
      </button>
    );
  }

  return (
    <div>
      {wallets.map((w) => (
        <button
          className='bg-black text-white px-3 py-2 rounded-xl  ml-[40%] mt-8'
          key={w.name}
          onClick={() => connect(w)}
          disabled={status === 'connecting'}
        >
          Connect {w.name}
        </button>
      ))}
    </div>
  );
}
