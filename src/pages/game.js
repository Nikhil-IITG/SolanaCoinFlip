import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import Navbar from '../components/navbar';

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

export default function CoinFlipGame() {
  const { publicKey, sendTransaction, disconnect, select, wallet } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [balance, setBalance] = useState(null); // Set to null initially to indicate loading
  const [betAmount, setBetAmount] = useState(100000000); // Default bet amount in lamports (0.1 SOL)
  const [choice, setChoice] = useState('heads');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [currentSide, setCurrentSide] = useState('heads'); // Track current side of the coin
  const [error, setError] = useState(null); // To track any errors

  useEffect(() => {
    if (publicKey) {
      const fetchBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance);
        } catch (error) {
          setError('Failed to fetch balance. Please try again.');
          console.error("Error fetching balance:", error);
        }
      };
      fetchBalance();
    }
  }, [publicKey, connection]);

  const flipCoin = async () => {
    if (!publicKey) {
      alert('Please connect your wallet!');
      return;
    }

    if (betAmount > balance) {
      alert('Insufficient balance!');
      return;
    }

    setIsLoading(true);
    setFlipping(true); // Start flipping animation
    setResult(null); // Reset result

    const totalFlips = Math.floor(Math.random() * 5) + 5; // Randomize the number of flips between 5 and 10

    let flipCount = 0;

    const flipInterval = setInterval(() => {
      // Alternate between heads and tails
      setCurrentSide(prev => (prev === 'heads' ? 'tails' : 'heads'));
      flipCount++;

      if (flipCount >= totalFlips) {
        clearInterval(flipInterval);
        setFlipping(false); // Stop flipping animation

        const simulatedResult = Math.random() < 0.5 ? 'heads' : 'tails';
        setCurrentSide(simulatedResult); // Set the final side

        if (simulatedResult === choice) {
          setResult('You won!');
          handleWin(); // Handle win
        } else {
          setResult('You lost!');
          handleLoss(); // Handle loss
        }
      }
    }, 500); // Speed of the flipping
  };

  const handleWin = async () => {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: programId,
          toPubkey: publicKey,
          lamports: betAmount * 2, // Double the bet amount
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');

      // Update balance after transaction
      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance);
    } catch (error) {
      setError('Transaction failed! Please try again.');
      console.error('Transaction failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoss = async () => {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: programId,
          lamports: betAmount, // Deduct the bet amount
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');

      // Update balance after transaction
      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance);
    } catch (error) {
      setError('Transaction failed! Please try again.');
      console.error('Transaction failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await disconnect();
      select(null); // Explicitly clear the wallet selection
      router.push('/'); // Redirect to homepage
    }
  };

  return (
    <>
      <Navbar />
      <div className="game_container">
        <div className="game_title">Solana Coin Flip Game</div>
        <div className="game_balanceText">
          {balance === null ? "Loading balance..." : `Current Balance: ${(balance / 1000000000).toFixed(2)} SOL`}
        </div>
        <div className="game_buttons">
          <button
            onClick={() => setChoice('heads')}
            className={`game_button ${choice === 'heads' ? 'game_buttonHeads' : ''}`}
          >
            Heads
          </button>
          <button
            onClick={() => setChoice('tails')}
            className={`game_button ${choice === 'tails' ? 'game_buttonTails' : ''}`}
          >
            Tails
          </button>
        </div>
        {/* Bet Amount Input */}
        <div className="game_betInputContainer">
          <input
            type="number"
            value={betAmount / 1000000000}
            onChange={(e) => setBetAmount(e.target.value * 1000000000)}
            className="game_betInput"
            placeholder="Enter bet amount in SOL"
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Display Bet Amount Separately */}
        <div className="game_betText">
          Your Bet: {(betAmount / 1000000000).toFixed(2)} SOL
        </div>

        {/* Coin Flip Element */}
        <div className="game_coinContainer">
          <div className={`coin ${flipping ? 'flipping' : ''}`}>
            <div className={currentSide}>
              <img src={`/coin-${currentSide}.png`} alt={currentSide} />
            </div>
          </div>
        </div>

        <div className="game_resultContainer">
          <button
            onClick={flipCoin}
            disabled={isLoading}
            className="game_flipButton"
          >
            {isLoading ? 'Flipping...' : 'Flip Coin'}
          </button>
          {result && <div className="game_result">{result}</div>}
        </div>

        {error && <div className="game_error">{error}</div>}

        <button
          onClick={handleLogout}
          className="game_logoutButton"
        >
          Go Back to Homepage
        </button>
      </div>
    </>
  );
}
