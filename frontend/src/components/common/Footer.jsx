import React from 'react';

export const Footer = () => {
  return (
    <footer style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '2rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div>
          <strong>SmartBlood Network</strong> &bull; AWS Weekend Challenge – No Pipeline, No Problem
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>AWS Lambda</span>
          <span>Amazon DynamoDB</span>
          <span>API Gateway</span>
          <span>Amazon SNS</span>
          <span>Amazon Cognito</span>
        </div>
      </div>
    </footer>
  );
};

