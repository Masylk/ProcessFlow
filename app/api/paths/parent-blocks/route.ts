import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { relationships } = await req.json();

    const createdRelationships = await prisma.path_parent_block.createMany({
      data: relationships.map((rel: any) => ({
        path_id: rel.path_id,
        block_id: rel.block_id,
      })),
    });

    return NextResponse.json(createdRelationships);
  } catch (error) {
    console.error('Error creating path-block relationships:', error);
    return NextResponse.json(
      { error: 'Failed to create path-block relationships' },
      { status: 500 }
    );
  }
} 