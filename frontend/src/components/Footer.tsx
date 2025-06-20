import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '3rem 2rem 2rem',
      textAlign: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        textAlign: 'left'
      }}>
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem', fontWeight: '600' }}>
            Verdict
          </h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            A decentralized voting platform powered by Solana blockchain. 
            Create polls, vote transparently, and let your voice be heard.
          </p>
        </div>
        
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem', fontWeight: '600' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#home" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}>
                Home
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#create" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}>
                Create Poll
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#polls" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}>
                Active Polls
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem', fontWeight: '600' }}>
            Legal Information
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}>
                Security
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}>
                Privacy Policy
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}>
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem', fontWeight: '600' }}>
            Contact
          </h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
            📧 info@verdict.com
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            🌐 www.verdict.com/contact
          </p>
          <button style={{
            marginTop: '1rem',
            background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
            color: '#0a0a0a',
            fontWeight: '600',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}>
            Contact Us
          </button>
        </div>
      </div>
      
      <div style={{
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        <p>© 2024 Verdict. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
