import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';

export default function Home() {
  const { connect, disconnect, connected, select, wallets, wallet } = useWallet();
  const router = useRouter();
  const network = 'devnet';
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (connected) {
      router.push({
        pathname: '/game',
        query: { network, balance: 500 },
      });
    }
  }, [connected]);

  const handleSelectWallet = async () => {
    if (!wallet) {
      select(wallets[0].adapter.name); // Automatically select the first available wallet
    }
    setIsLoading(true);
    try {
      await connect();
      if (connected) {
        router.push({
          pathname: '/game',
          query: { network, balance: 500 },
        });
      } else {
        await disconnect();
      }
    } catch (error) {
      console.error('Login failed:', error);
      await disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="index_container">

        <h1 className="index_title">Welcome to Solana CoinFlip</h1>
        <p className="index_subtitle">Connect your wallet to start playing on the Devnet</p>
        <div className="index_buttonContainer_container">
        <span className="index_buttonContainer">
          <button
            className="index_button"
            onClick={handleSelectWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Connect to Wallet'}
          </button>
        </span>
        </div>
        <p className="index_footerText">
          Connect a wallet on Solana to continue
        </p>
      </div>
    </>
  );
}
