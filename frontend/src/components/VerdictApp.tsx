import React, { useState, useEffect } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import CreatePoll from './CreatePoll';
import ActivePolls from './ActivePolls';
import Footer from './Footer';

interface Poll {
  id: number;
  question: string;
  options: string[];
  vote_counts: number[];
  total_votes: number;
  created_at: string;
  creator_address: string;
  tx_id: string;
  blockchain_address?: string;
}

const VerdictApp: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Mock wallet connection (will be replaced with real Solana wallet)
  const connectWallet = async () => {
    setLoading(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsWalletConnected(true);
      setWalletAddress('GdXpvGV9Xc5p83qwqoSc2Z6FxhiPJXMSD8ACKq4a4yMX');
      setLoading(false);
    }, 1000);
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  // Fetch polls from backend
  const fetchPolls = async () => {
    try {
      const response = await fetch('http://localhost:8080/polls');
      const data = await response.json();
      setPolls(data.polls || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  // Create new poll
  const createPoll = async (question: string, options: string[]) => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          options,
          creator_address: walletAddress,
        }),
      });

      if (response.ok) {
        await fetchPolls(); // Refresh polls
        return true;
      } else {
        throw new Error('Failed to create poll');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll');
      return false;
    }
  };

  // Vote on poll
  const vote = async (pollId: number, optionIndex: number) => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poll_id: pollId,
          option_index: optionIndex,
          voter_address: walletAddress,
        }),
      });

      if (response.ok) {
        await fetchPolls(); // Refresh polls
        alert('Vote cast successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to vote');
      }
    } catch (error: any) {
      console.error('Error voting:', error);
      alert(error.message || 'Failed to vote');
    }
  };

  // Fetch polls on component mount
  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="verdict-container">
      <Header 
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        loading={loading}
      />
      
      <HeroSection 
        isWalletConnected={isWalletConnected}
        onConnectWallet={connectWallet}
        loading={loading}
      />
      
      <CreatePoll 
        onCreatePoll={createPoll}
        isWalletConnected={isWalletConnected}
      />
      
      <ActivePolls 
        polls={polls}
        onVote={vote}
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
      />
      
      <Footer />
    </div>
  );
};

export default VerdictApp;
