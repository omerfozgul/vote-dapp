import React from 'react';

interface HeroSectionProps {
  isWalletConnected: boolean;
  onConnectWallet: () => void;
  loading: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  isWalletConnected,
  onConnectWallet,
  loading
}) => {
  return (
    <section className="verdict-hero" id="home">
      <h1>
        Create and join meaningful polls
        <br />
        — your wallet is your voice.
      </h1>
      
      <p>
        Connect your Phantom Wallet to start creating and voting in community-powered polls.
      </p>
      
      {!isWalletConnected && (
        <button 
          onClick={onConnectWallet}
          className="verdict-button"
          disabled={loading}
          style={{ fontSize: '1.2rem', padding: '1.5rem 3rem' }}
        >
          {loading ? (
            <>
              <span className="loading">Connecting...</span>
              <span>⏳</span>
            </>
          ) : (
            <>
              <span>Connect Wallet</span>
              <span>🔗</span>
            </>
          )}
        </button>
      )}
      
      {isWalletConnected && (
        <div className="wallet-connected">
          <span style={{ color: '#00ff88', fontWeight: '700', fontSize: '1.1rem' }}>
            ✅ Wallet Connected! You can now create polls and vote.
          </span>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
