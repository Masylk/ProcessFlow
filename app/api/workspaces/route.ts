import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        user_workspaces: {
          include: {
            user: true, // Fetch user details for each workspace
          },
        },
      },
    });
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, user_id } = await req.json();

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Définir trois couleurs de fond dans les tons bleu, rouge et vert
    const background_colours = ['#4299E1', '#F56565', '#48BB78'];
    // Sélectionner aléatoirement une couleur parmi les trois
    const randomIndex = Math.floor(Math.random() * background_colours.length);
    const randomColour = background_colours[randomIndex];

    // Créer le workspace et lier le créateur en tant qu'ADMIN, en assignant la couleur de fond aléatoire
    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        background_colour: randomColour,
        team_tags: [],
        user_workspaces: {
          create: {
            user_id: Number(user_id),
            role: 'ADMIN',
          },
        },
      },
      include: {
        user_workspaces: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
