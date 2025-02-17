// app/api/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces
 *     description: Fetches all workspaces along with their associated users.
 *     tags:
 *       - Workspace
 *     responses:
 *       200:
 *         description: A list of workspaces with user details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Workspace A"
 *                   background_colour:
 *                     type: string
 *                     example: "#4299E1"
 *                   user_workspaces:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 1
 *                         role:
 *                           type: string
 *                           example: "ADMIN"
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             username:
 *                               type: string
 *                               example: "john_doe"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch workspaces"
 *
 *   post:
 *     summary: Create a new workspace
 *     description: Creates a new workspace and assigns a user as the admin, with a randomly selected background color.
 *     tags:
 *       - Workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Workspace"
 *               user_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "New Workspace"
 *                 background_colour:
 *                   type: string
 *                   example: "#F56565"
 *                 user_workspaces:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       role:
 *                         type: string
 *                         example: "ADMIN"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: "john_doe"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create workspace"
 */
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
        user_workspaces: {
          create: {
            user_id: Number(user_id),
            role: 'ADMIN', // Assigner le créateur en tant qu'ADMIN
          },
        },
      },
      include: {
        user_workspaces: {
          include: {
            user: true, // Retourner les détails de l'utilisateur avec le workspace
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
