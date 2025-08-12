import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  // If it's already a domain-like string, use it directly
  if (q.includes('.')) {
    const domain = q.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    // Request a high quality image with specific dimensions
    const iconUrl = `https://cdn.brandfetch.io/${domain}/icon?h=192&q=100&c=1idr1bVveqwYDg79PNN`;
    return NextResponse.json({ 
      icon: iconUrl,
      domain: domain 
    }, { 
      headers: {
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }

  // If it's a brand name, search for it first
  try {
    const searchRes = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(q)}`, {
      headers: {
        'Authorization': 'Bearer 1idr1bVveqwYDg79PNN'
      }
    });

    if (!searchRes.ok) {
      throw new Error('Search failed');
    }

    const searchData = await searchRes.json();
    
    // Get the first result's domain
    if (searchData && searchData.length > 0 && searchData[0].domain) {
      const domain = searchData[0].domain;
      const iconUrl = `https://cdn.brandfetch.io/${domain}/icon?h=192&q=100&c=1idr1bVveqwYDg79PNN`;
      
      return NextResponse.json({ 
        icon: iconUrl,
        domain: domain 
      }, { 
        headers: {
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }

    return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  } catch (error) {
    console.error('BrandFetch API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
