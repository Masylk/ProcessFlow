import * as React from 'react';
import { Section, Text, Link, Img } from '@react-email/components';

type NoReplySignatureProps = {
  publicUrls?: {
    supabasePublicUrl?: string;
    supabaseStoragePath?: string;
    // producthuntUrl?: string;
    linkedinUrl?: string;
    // xUrl?: string;
    [key: string]: string | undefined;
  };
};

export const NoReplySignature: React.FC<NoReplySignatureProps> = ({ publicUrls = {} }) => {
  // Construct the image URLs from public URLs or use fallbacks
  const supabaseUrl = publicUrls.supabasePublicUrl || '';
  const storagePath = publicUrls.supabaseStoragePath || '';
  
  // Social media icons from Supabase
  // const xIconUrl = supabaseUrl && storagePath 
  //   ? `${supabaseUrl}${storagePath}/images/mail_x.png`
  //   : 'https://via.placeholder.com/20';
    
  // const productHuntIconUrl = supabaseUrl && storagePath 
  //   ? `${supabaseUrl}${storagePath}/images/mail_product_hunt.png`
  //   : 'https://via.placeholder.com/20';
    
  const linkedinIconUrl = supabaseUrl && storagePath 
    ? `${supabaseUrl}${storagePath}/images/mail_linkedin.png`
    : 'https://via.placeholder.com/20';
    
  // Social media URLs from public URLs or use defaults
  // const productHuntUrl = publicUrls.producthuntUrl || 'https://www.producthunt.com';
  const linkedinUrl = publicUrls.linkedinUrl || 'https://www.linkedin.com/company/processflow1/';
  // const xUrl = publicUrls.xUrl || 'https://x.com';

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
        {/* <Link href={productHuntUrl} style={{ textDecoration: 'none', marginRight: '10px', display: 'inline-block' }}>
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
        </Link> */}
        <Link href={linkedinUrl} style={{ textDecoration: 'none', marginRight: '10px', display: 'inline-block' }}>
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
        {/* <Link href={xUrl} style={{ textDecoration: 'none', marginRight: '10px', display: 'inline-block' }}>
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
        </Link> */}
      </div>
    </Section>
  );
}; 