import React, { useState } from 'react';

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

interface ActivePollsProps {
  polls: Poll[];
  onVote: (pollId: number, optionIndex: number) => void;
  isWalletConnected: boolean;
  walletAddress: string;
}

const ActivePolls: React.FC<ActivePollsProps> = ({ 
  polls, 
  onVote, 
  isWalletConnected, 
  walletAddress 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number }>({});

  const handleVote = (pollId: number) => {
    const optionIndex = selectedOptions[pollId];
    if (optionIndex !== undefined) {
      onVote(pollId, optionIndex);
    } else {
      alert('Please select an option before voting');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <section className="verdict-section" id="polls">
      <h2>Active Polls</h2>
      <p className="subtitle">Cast Your Vote!</p>
      
      {polls.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(26, 77, 58, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '16px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No active polls yet</p>
          <p>Be the first to create a poll!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {polls.map((poll) => (
            <div
              key={poll.id}
              style={{
                background: 'rgba(26, 77, 58, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 255, 136, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#ffffff'
              }}>
                {poll.question}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {poll.options.map((option, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      cursor: isWalletConnected ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => {
                      if (isWalletConnected) {
                        setSelectedOptions({
                          ...selectedOptions,
                          [poll.id]: index
                        });
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (isWalletConnected) {
                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    {/* Progress bar background */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${getPercentage(poll.vote_counts[index], poll.total_votes)}%`,
                        background: 'rgba(0, 255, 136, 0.2)',
                        transition: 'width 0.3s ease',
                        zIndex: 1
                      }}
                    />
                    
                    <input
                      type="radio"
                      name={`poll-${poll.id}`}
                      checked={selectedOptions[poll.id] === index}
                      onChange={() => {}}
                      disabled={!isWalletConnected}
                      style={{
                        marginRight: '0.75rem',
                        accentColor: '#00ff88',
                        zIndex: 2,
                        position: 'relative'
                      }}
                    />
                    
                    <span style={{ 
                      flex: 1, 
                      zIndex: 2, 
                      position: 'relative',
                      color: '#ffffff'
                    }}>
                      {option}
                    </span>
                    
                    <span style={{ 
                      fontSize: '0.9rem', 
                      color: '#00ff88',
                      fontWeight: '500',
                      zIndex: 2,
                      position: 'relative'
                    }}>
                      {poll.vote_counts[index]} ({getPercentage(poll.vote_counts[index], poll.total_votes)}%)
                    </span>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Total votes: {poll.total_votes}</span>
                <span>Created: {formatDate(poll.created_at)}</span>
              </div>
              
              <button
                onClick={() => handleVote(poll.id)}
                disabled={!isWalletConnected || selectedOptions[poll.id] === undefined}
                style={{
                  background: (isWalletConnected && selectedOptions[poll.id] !== undefined)
                    ? 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)'
                    : '#666',
                  color: '#0a0a0a',
                  fontWeight: '600',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isWalletConnected && selectedOptions[poll.id] !== undefined) 
                    ? 'pointer' 
                    : 'not-allowed',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (isWalletConnected && selectedOptions[poll.id] !== undefined) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 255, 136, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {!isWalletConnected ? 'Connect Wallet to Vote' : 'Vote ⚡'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ActivePolls;
