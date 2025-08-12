import { isVercel } from '@/app/api/utils/isVercel';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

export async function POST(req: NextRequest) {
    const prisma_client = isVercel() ? new PrismaClient() : prisma;
    if (!prisma_client) {
        throw new Error('Prisma client not initialized');
    }
    const { email } = await req.json();
    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    try {
        const user = await prisma_client.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ auth_id: user.auth_id });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (isVercel()) {
            await prisma_client.$disconnect();
        }
    }
}
