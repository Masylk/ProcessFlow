import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const logoRes = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(q)}`, {
      headers: {
        'Authorization': 'Bearer: sk_JoKHtkTJT6SmOZENqcD-Jg',
      },
    });
    const data = await logoRes.json();
    if (!logoRes.ok) {
      return NextResponse.json({ error: data.error || 'Logo.dev error' }, { status: logoRes.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
