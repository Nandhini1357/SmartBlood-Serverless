import React from 'react';
import { Heart, ShieldCheck, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '2.5rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
              <span>🩸</span>
              <span>SmartBlood</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Intelligent Serverless Blood Donation Network &bull; AWS Weekend Challenge – No Pipeline, No Problem
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={14} color="#f59e0b" /> AWS Lambda (ARM64)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} color="#10b981" /> Amazon DynamoDB
            </span>
            <span>Amazon API Gateway</span>
            <span>Amazon SNS</span>
            <span>Amazon Cognito</span>
            <span>S3 + CloudFront</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            &copy; 2026 SmartBlood Healthcare Network. All metrics and demo data simulated for hackathon review.
          </div>
          <div>
            Designed with Zero Idle Cost &bull; Continuous Availability
          </div>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-alt)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, border: '1px solid var(--border)' }}>
          <strong>Medical & Clinical Safety Notice:</strong> SmartBlood is an automated emergency discovery and triage coordination network. Hospital clinical staff and transfusion laboratory pathologists must conduct standard pre-transfusion serological cross-matching, blood type verification, and regulatory screening prior to any clinical administration.
        </div>
      </div>
    </footer>
  );
};
