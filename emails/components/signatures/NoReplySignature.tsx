import * as React from 'react';
import { Section, Text, Link, Img } from '@react-email/components';

type NoReplySignatureProps = {
  env?: {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_STORAGE_PATH?: string;
  };
};

export const NoReplySignature: React.FC<NoReplySignatureProps> = ({ env }) => {
  // Construct the image URLs from environment variables or use fallbacks
  const supabaseUrl = env?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = env?.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  
  // Social media icons from Supabase
  const xIconUrl = supabaseUrl && storagePath 
    ? `${supabaseUrl}${storagePath}/images/mail_x.png`
    : 'https://via.placeholder.com/20';
    
  const productHuntIconUrl = supabaseUrl && storagePath 
    ? `${supabaseUrl}${storagePath}/images/mail_product_hunt.png`
    : 'https://via.placeholder.com/20';
    
  const linkedinIconUrl = supabaseUrl && storagePath 
    ? `${supabaseUrl}${storagePath}/images/mail_linkedin.png`
    : 'https://via.placeholder.com/20';
    
  const g2IconUrl = supabaseUrl && storagePath 
    ? `${supabaseUrl}${storagePath}/images/mail_g2.png`
    : 'https://via.placeholder.com/20';

  return (
    <Section style={{ marginTop: '32px' }}>
      <Text style={{ 
        fontFamily: 'Inter, sans-serif',
        fontSize: '18px',
        fontWeight: 600,
        margin: '0 0 4px 0',
        color: '#000000', // Explicitly set to black
      }}>
        ProcessFlow Team
      </Text>
      <div style={{ marginTop: '8px' }}>
        <Link href="https://www.producthunt.com" style={{ textDecoration: 'none', marginRight: '10px', display: 'inline-block' }}>
          <Img
            src={productHuntIconUrl}
            width="20"
            height="20"
            alt="ProductHunt"
            style={{ 
              display: 'inline-block', 
              verticalAlign: 'middle', 
              border: 'none',
              maxWidth: '20px',
              maxHeight: '20px'
            }}
          />
        </Link>
        <Link href="https://www.linkedin.com/company/processflow1/" style={{ textDecoration: 'none', marginRight: '10px', display: 'inline-block' }}>
          <Img
            src={linkedinIconUrl}
            width="20"
            height="20"
            alt="LinkedIn"
            style={{ 
              display: 'inline-block', 
              verticalAlign: 'middle',
              border: 'none',
              maxWidth: '20px',
              maxHeight: '20px'
            }}
          />
        </Link>
        <Link href="https://x.com" style={{ textDecoration: 'none', marginRight: '10px', display: 'inline-block' }}>
          <Img
            src={xIconUrl}
            width="20"
            height="20"
            alt="X"
            style={{ 
              display: 'inline-block', 
              verticalAlign: 'middle',
              border: 'none',
              maxWidth: '20px',
              maxHeight: '20px'
            }}
          />
        </Link>
        <Link href="https://www.g2.com" style={{ textDecoration: 'none', marginRight: '10px', display: 'inline-block' }}>
          <Img
            src={g2IconUrl}
            width="20"
            height="20"
            alt="G2"
            style={{ 
              display: 'inline-block', 
              verticalAlign: 'middle',
              border: 'none',
              maxWidth: '20px',
              maxHeight: '20px'
            }}
          />
        </Link>
      </div>
    </Section>
  );
}; 