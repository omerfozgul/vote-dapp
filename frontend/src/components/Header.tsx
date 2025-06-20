import React from 'react';
import verdictLogo from '../content/verdict-logo.png';

interface HeaderProps {
  isWalletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({
  isWalletConnected,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  loading
}) => {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="verdict-header">
      <div className="verdict-logo">
        <img src={verdictLogo} alt="Verdict" />
      </div>
      
      <nav className="verdict-nav">
        <a 
          href="#home" 
          className="active"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}
        >
          Home
        </a>
        <a 
          href="#create"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('create');
          }}
        >
          Create Poll
        </a>
        <a 
          href="#polls"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('polls');
          }}
        >
          Active Polls
        </a>
      </nav>
      
      <div>
        {isWalletConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 255, 136, 0.3)'
            }}>
              <span style={{ color: '#00ff88', fontSize: '0.9rem', fontWeight: '600' }}>
                {truncateAddress(walletAddress)}
              </span>
            </div>
            <button 
              onClick={onDisconnectWallet}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={onConnectWallet}
            className="verdict-button"
            disabled={loading}
            style={{ padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              <>
                <span className="loading">Connecting...</span>
              </>
            ) : (
              <>
                <span>Connect Wallet</span>
                <span>🔗</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
