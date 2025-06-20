import React, { useState } from 'react';

interface CreatePollProps {
  onCreatePoll: (question: string, options: string[]) => Promise<boolean | undefined>;
  isWalletConnected: boolean;
}

const CreatePoll: React.FC<CreatePollProps> = ({ onCreatePoll, isWalletConnected }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate form
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    setLoading(true);
    const success = await onCreatePoll(question.trim(), validOptions);
    
    if (success) {
      // Reset form
      setQuestion('');
      setOptions(['', '', '', '']);
      alert('Poll created successfully! 🎉');
    }
    
    setLoading(false);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <section className="verdict-section" id="create">
      <h2>Enter Your Question. Define Options.</h2>
      <p className="subtitle">Start Collecting Votes!</p>
      
      <div className="poll-form">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.8rem', 
              fontWeight: '600',
              color: '#ffffff',
              fontSize: '1.1rem'
            }}>
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              disabled={!isWalletConnected}
              className="form-input"
              style={{ fontSize: '1.1rem' }}
            />
          </div>

          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.8rem', 
              fontWeight: '600',
              color: '#ffffff',
              fontSize: '1.1rem'
            }}>
              Options
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Enter option ${index + 1}${index < 2 ? ' (required)' : ' (optional)'}`}
                  disabled={!isWalletConnected}
                  className="form-input"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isWalletConnected || loading}
            className="verdict-button"
            style={{
              width: '100%',
              fontSize: '1.2rem',
              padding: '1.5rem 2rem',
              opacity: (!isWalletConnected || loading) ? 0.5 : 1,
              cursor: (!isWalletConnected || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <span className="loading">Creating Poll...</span>
                <span>⏳</span>
              </>
            ) : (
              <>
                <span>Publish</span>
                <span>⚡</span>
              </>
            )}
          </button>

          {!isWalletConnected && (
            <p style={{ 
              marginTop: '1.5rem', 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1rem',
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              🔒 Connect your wallet to create polls
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default CreatePoll;
