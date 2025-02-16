import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const userId = parseInt(params.user_id); // Use the user_id from the URL

  try {
    // Fetch user's workspaces with all necessary relations
    const userWorkspaces = await prisma.user_workspace.findMany({
      where: {
        user_id: userId,
      },
      include: {
        workspace: {
          include: {
            folders: {
              orderBy: {
                id: 'asc',
              },
            },
            workflows: {
              orderBy: {
                id: 'asc',
              },
            },
            user_workspaces: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Extract workspaces from the user_workspaces relation
    const workspaces = userWorkspaces.map(uw => uw.workspace);

    if (!workspaces || workspaces.length === 0) {
      // Définir une couleur de fond par défaut
      const defaultBackgroundColor = '#4299E1';

      // Create the default workspace and include folders (which will be empty)
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          background_colour: defaultBackgroundColor,
          team_tags: [], // Initialisation du tableau vide
          created_at: new Date(), // Date de création
          updated_at: new Date(), // Date de mise à jour
          user_workspaces: {
            create: {
              user_id: userId,
              role: 'ADMIN',
            },
          },
        },
        include: {
          folders: {
            orderBy: {
              id: 'asc',
            },
          },
          workflows: {
            orderBy: {
              id: 'asc',
            },
          },
          user_workspaces: {
            include: {
              user: true,
            },
          },
        },
      });

      // Mettre à jour l'active_workspace_id de l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: {
          active_workspace_id: newWorkspace.id,
        },
      });

      return NextResponse.json([newWorkspace]);
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
