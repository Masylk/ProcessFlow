// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();

/** @type {string[]} */
let createdTestUsers = [];

/**
 * @param {string} email
 * @returns {Promise<string|null>}
 */
async function getUserIdByEmail(email) {
  try {
    const res = await fetch(`${BASE_URL}/api/test/get-user-by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.auth_id;
  } catch (err) {
    console.error(`Error fetching userId for email ${email}:`, err);
    return null;
  }
}

/**
 * @param {string} email
 * @returns {Promise<void>}
 */
async function cleanupTestUser(email) {
  if (!email) return;
  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
      console.warn(`No userId found for email: ${email}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/deleteUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error(`Failed to delete user: ${error.error}`);
    } else {
      console.log(`🧹 Deleted user: ${email} (userId: ${userId})`);
    }
    createdTestUsers = createdTestUsers.filter(e => e !== email);
  } catch (err) {
    console.error(`Error cleaning up user ${email}:`, err);
  }
}

/**
 * @param {object} userData
 * @this {any}
 */
async function seedTestUser(userData) {
  if (!createdTestUsers.includes(userData.email)) {
    createdTestUsers.push(userData.email);
  }
  let onboarding_step = 'PERSONAL_INFO';
  if (userData.onboarding_step) onboarding_step = userData.onboarding_step;
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const isCompleted = onboarding_step === 'COMPLETED';
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: userData.email_confirmed,
    user_metadata: {
      onboarding_step,
      onboarding_status: {
        current_step: onboarding_step,
        completed_at: isCompleted ? new Date().toISOString() : null
      }
    }
  });
  let resultUser = authUser;
  if (authError) {
    if (authError.message === 'A user with this email address has already been registered') {
      const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: userData.email });
      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`);
      }
      const user = userList?.users?.[0];
      if (!user) {
        throw new Error(`User with email ${userData.email} not found for update.`);
      }
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: userData.email_confirmed,
        user_metadata: {
          onboarding_step,
          onboarding_status: {
            current_step: onboarding_step,
            completed_at: isCompleted ? new Date().toISOString() : null
          }
        }
      });
      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }
      console.log(`🔄 Updated user ${userData.email} with new data.`);
      resultUser = updatedUser;
    } else {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }
  } else {
    console.log(`✅ Created user ${userData.email} with confirmed email: ${userData.email_confirmed}`);
  }
  if (typeof this !== 'undefined') {
    this.supabaseUser = resultUser && resultUser.user ? resultUser.user : resultUser;
  }
  let auth_id, email;
  if (this && this.supabaseUser) {
    auth_id = this.supabaseUser.id;
    email = this.supabaseUser.email;
  } else {
    auth_id = resultUser && resultUser.user ? resultUser.user.id : resultUser.id;
    email = resultUser && resultUser.user ? resultUser.user.email : resultUser.email;
  }
  if (!auth_id || !email) {
    console.error('❌ Cannot seed Prisma user: supabaseUser is missing or incomplete.');
    return resultUser;
  }
  let prismaOnboardingStep = onboarding_step;
  let user = await prisma.user.findUnique({ where: { auth_id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        auth_id,
        email,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        full_name: userData.full_name || '',
        onboarding_step: prismaOnboardingStep,
        onboarding_completed_at: isCompleted ? new Date().toISOString() : null,
      }
    });
    console.log(`✅ Seeded Prisma user for auth_id: ${auth_id}`);
  } else {
    user = await prisma.user.update({
      where: { auth_id },
      data: {
        onboarding_step: prismaOnboardingStep,
        onboarding_completed_at: isCompleted ? new Date().toISOString() : null,
      }
    });
    console.log(`ℹ️ Prisma user already exists for auth_id: ${auth_id}, updated onboarding_step.`);
  }
  if (this) this.prismaUser = user;
  return resultUser;
}

/**
 * @param {{name: string}} param0
 * @this {any}
 */
async function seedWorkspace({ name }) {
  if (!this.prismaUser || !this.prismaUser.id) {
    console.error('❌ Cannot seed workspace: this.prismaUser is not defined. Seed a Prisma user first.');
    return null;
  }
  const user_id = this.prismaUser.id;
  let workspace = await prisma.workspace.findFirst({
    where: {
      name,
      user_workspaces: { some: { user_id, role: 'ADMIN' } }
    }
  });
  if (!workspace) {
    const background_colours = ['#4299E1', '#F56565', '#48BB78'];
    const randomColour = background_colours[Math.floor(Math.random() * background_colours.length)];
    let slug;
    let isUnique = false;
    while (!isUnique) {
      slug = Math.floor(Math.random() * 1e9).toString();
      const existing = await prisma.workspace.findUnique({ where: { slug } });
      if (!existing) isUnique = true;
    }
    workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        background_colour: randomColour,
        user_workspaces: {
          create: {
            user_id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        user_workspaces: true,
      },
    });
    console.log(`✅ Seeded workspace "${name}" for user_id: ${user_id} with slug: ${slug}`);
  } else {
    console.log(`ℹ️ Workspace "${name}" already exists for user_id: ${user_id}`);
  }
  if (this) this.workspace = workspace;
  return workspace;
}

/**
 * @param {string} auth_id
 * @returns {Promise<void>}
 */
async function cleanupPrismaUser(auth_id) {
  if (!auth_id) {
    console.warn('No auth_id provided for Prisma user cleanup.');
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { auth_id } });
    if (user) {
      await prisma.user.delete({ where: { auth_id } });
      console.log(`🧹 Deleted Prisma user with auth_id: ${auth_id}`);
    } else {
      console.log(`ℹ️ No Prisma user found for auth_id: ${auth_id}`);
    }
  } catch (err) {
    console.error(`Error cleaning up Prisma user with auth_id ${auth_id}:`, err);
  }
}

/**
 * @param {{name: string, user_id: number}} param0
 * @returns {Promise<void>}
 */
async function cleanupWorkspace({ name, user_id }) {
  if (!name || !user_id) {
    console.warn('Workspace name and user_id are required for workspace cleanup.');
    return;
  }
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        name,
        user_workspaces: { some: { user_id, role: 'ADMIN' } }
      }
    });
    if (workspace) {
      await prisma.user_workspace.deleteMany({ where: { workspace_id: workspace.id } });
      await prisma.workspace.delete({ where: { id: workspace.id } });
      console.log(`🧹 Deleted workspace "${name}" and its user_workspace relations for user_id: ${user_id}`);
    } else {
      console.log(`ℹ️ No workspace named "${name}" found for user_id: ${user_id}`);
    }
  } catch (err) {
    console.error(`Error cleaning up workspace "${name}" for user_id ${user_id}:`, err);
  }
}

module.exports = {
  seedTestUser,
  seedWorkspace,
  cleanupPrismaUser,
  cleanupWorkspace,
  getUserIdByEmail,
  cleanupTestUser,
  createdTestUsers,
}; 