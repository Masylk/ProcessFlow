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
    const res = await fetch(`${BASE_URL}/api/test/cleanup-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error(`Failed to delete user: ${error.error}`);
    } else {
      console.log(`🧹 Deleted user: ${email}`);
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
  const res = await fetch(`${BASE_URL}/api/test/seed-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Failed to seed user: ${error.error}`);
  }
  const { user } = await res.json();
  if (this) this.prismaUser = user;
  return user;
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
  const res = await fetch(`${BASE_URL}/api/test/seed-workspace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, user_id: this.prismaUser.id }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Failed to seed workspace: ${error.error}`);
  }
  const { workspace } = await res.json();
  if (this) this.workspace = workspace;
  return workspace;
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
    const res = await fetch(`${BASE_URL}/api/test/cleanup-workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, user_id }),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error(`Failed to delete workspace: ${error.error}`);
    } else {
      console.log(`🧹 Deleted workspace "${name}" for user_id: ${user_id}`);
    }
  } catch (err) {
    console.error(`Error cleaning up workspace "${name}" for user_id ${user_id}:`, err);
  }
}

module.exports = {
  seedTestUser,
  seedWorkspace,
  cleanupWorkspace,
  getUserIdByEmail,
  cleanupTestUser,
  createdTestUsers,
}; 