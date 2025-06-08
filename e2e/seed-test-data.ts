import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

// Environment validation
const validateEnvironment = () => {
  // Prevent running in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('🚫 Test seeding is forbidden in production environment');
  }
  
  // Validate required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Warn if URL contains production indicators
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (supabaseUrl.includes('prod') || supabaseUrl.includes('production')) {
    throw new Error('🚫 Supabase URL appears to be production. Aborting for safety.');
  }
  
  console.log('✅ Environment validation passed');
};

// Helper functions to reduce code duplication
const generateUniqueIdentifier = async (
  checkFunction: (identifier: string) => Promise<boolean>,
  baseIdentifier: string,
  isSlug: boolean = false
): Promise<string> => {
  let unique = baseIdentifier;
  let counter = 1;
  
  while (await checkFunction(unique)) {
    unique = isSlug ? `${baseIdentifier}-${counter}` : `${baseIdentifier} (${counter})`;
    counter++;
  }
  
  return unique;
};

const cleanupWithRetry = async (
  operation: () => Promise<void>,
  operationName: string,
  maxRetries: number = 3
): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await operation();
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.warn(`⚠️ ${operationName} failed after ${maxRetries} attempts:`, error instanceof Error ? error.message : String(error));
        throw error;
      }
      console.log(`⏳ ${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${attempt}s...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Test data configuration
const TEST_USERS = {
  MAIN_USER: {
    email: 'test-user@processflow-test.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User'
  },
  EDITOR_USER: {
    email: 'editor-user@processflow-test.com', 
    password: 'EditorPassword123!',
    firstName: 'Editor',
    lastName: 'User',
    fullName: 'Editor User'
  },
  VIEWER_USER: {
    email: 'viewer-user@processflow-test.com',
    password: 'ViewerPassword123!',
    firstName: 'Viewer',
    lastName: 'User', 
    fullName: 'Viewer User'
  }
};

const TEST_WORKSPACE = {
  name: 'Test Workspace',
  slug: 'test-workspace',
  iconUrl: '🧪',
  backgroundColour: '#f0f0f0'
};

const TEST_WORKFLOW = {
  name: 'Test Workflow for E2E',
  description: 'Automated test workflow for Cucumber tests',
  icon: '🔧'
};

class TestDataSeeder {
  private supabaseAdmin: any;
  private prisma: PrismaClient;

  constructor() {
    // Validate environment before initializing clients
    validateEnvironment();
    
    // Initialize Supabase admin client
    this.supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role for admin operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Initialize Prisma client
    this.prisma = new PrismaClient();
  }

  async seedTestData() {
    console.log('🌱 Starting test data seeding...');
    
    try {
      // 1. Clean up existing test data
      await this.cleanupTestData();
      
      // 2. Create test users in Supabase Auth
      const authUsers = await this.createAuthUsers();
      
      // 3. Create test users in database
      const dbUsers = await this.createDbUsers(authUsers);
      
      // 4. Create test workspace
      const workspace = await this.createTestWorkspace(dbUsers[0]);
      
      // 5. Add users to workspace
      await this.addUsersToWorkspace(workspace.id, dbUsers);
      
      // 6. Create test workflow
      const workflow = await this.createTestWorkflow(workspace.id, dbUsers[0].id);
      
      // 7. Create basic workflow structure
      await this.createBasicWorkflowStructure(workflow.id);
      
      console.log('✅ Test data seeding completed successfully!');
      console.log('📋 Test Data Summary:');
      console.log(`   - Users: ${Object.keys(TEST_USERS).length} created`);
      console.log(`   - Workspace: "${workspace.name}" (ID: ${workspace.id})`);
      console.log(`   - Workflow: "${workflow.name}" (ID: ${workflow.id})`);
      console.log(`   - Login URL: http://localhost:3000/login`);
      console.log(`   - Test User: ${TEST_USERS.MAIN_USER.email} / ${TEST_USERS.MAIN_USER.password}`);
      console.log(`   - Editor URL: /workspace/${workspace.id}/${workflow.name.toLowerCase().replace(/\s+/g, '-')}--pf-${workflow.id}/edit`);
      
      return {
        users: dbUsers,
        workspace,
        workflow,
        credentials: TEST_USERS
      };
      
    } catch (error) {
      console.error('❌ Test data seeding failed:', error);
      throw error;
    }
  }

  async cleanupTestData() {
    console.log('🧹 Cleaning up existing test data...');
    
    try {
      // Get test user auth IDs
      const testEmails = Object.values(TEST_USERS).map(user => user.email);
      const existingUsers = await this.prisma.user.findMany({
        where: { email: { in: testEmails } }
      });
      
      const authIds = existingUsers.map(user => user.auth_id);
      
      if (authIds.length > 0) {
        console.log(`Found ${authIds.length} existing test users to clean up`);
        
        // Get user IDs to find their workspaces
        const userIds = existingUsers.map(user => user.id);
        
        // Find test workspaces owned by these users or with test prefixes
        const testWorkspaces = await this.prisma.workspace.findMany({
          where: { 
            OR: [
              { slug: { startsWith: 'test-' } },
              { name: { contains: 'Test' } },
              { 
                user_workspaces: {
                  some: {
                    user_id: { in: userIds }
                  }
                }
              }
            ]
          },
          select: { id: true }
        });
        
        const workspaceIds = testWorkspaces.map(w => w.id);
        
        if (workspaceIds.length > 0) {
          console.log(`Found ${workspaceIds.length} test workspaces to clean up`);
          
          // Delete in correct order to respect foreign key constraints with retry logic
          await cleanupWithRetry(async () => {
            await this.prisma.stroke_line.deleteMany({
              where: { workflow: { workspace_id: { in: workspaceIds } } }
            });
          }, 'Stroke lines cleanup');
          
          await cleanupWithRetry(async () => {
            await this.prisma.path_parent_block.deleteMany({
              where: { path: { workflow: { workspace_id: { in: workspaceIds } } } }
            });
          }, 'Path parent block relationships cleanup');
          
          await cleanupWithRetry(async () => {
            await this.prisma.block.deleteMany({
              where: { workflow: { workspace_id: { in: workspaceIds } } }
            });
          }, 'Blocks cleanup');
          
          await cleanupWithRetry(async () => {
            await this.prisma.path.deleteMany({
              where: { workflow: { workspace_id: { in: workspaceIds } } }
            });
          }, 'Paths cleanup');
          
          await cleanupWithRetry(async () => {
            await this.prisma.workflow.deleteMany({
              where: { workspace_id: { in: workspaceIds } }
            });
          }, 'Workflows cleanup');
          
          await cleanupWithRetry(async () => {
            await this.prisma.user_workspace.deleteMany({
              where: { workspace_id: { in: workspaceIds } }
            });
          }, 'User workspace relationships cleanup');
          
          await cleanupWithRetry(async () => {
            await this.prisma.workspace.deleteMany({
              where: { id: { in: workspaceIds } }
            });
          }, 'Workspaces cleanup');
        }
        
        // 8. Finally delete users
        await this.prisma.user.deleteMany({
          where: { auth_id: { in: authIds } }
        });
        
        // Delete from Supabase Auth
        for (const authId of authIds) {
          try {
            await this.supabaseAdmin.auth.admin.deleteUser(authId);
          } catch (error) {
            console.warn(`Could not delete auth user ${authId}:`, error instanceof Error ? error.message : String(error));
          }
        }
      }
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.warn('⚠️ Cleanup had some issues (this is often normal):', error instanceof Error ? error.message : String(error));
    }
  }

  async createAuthUsers() {
    console.log('👤 Creating auth users in Supabase...');
    
    const authUsers = [];
    
    for (const [key, userData] of Object.entries(TEST_USERS)) {
      try {
        // Try to create the user
        const { data: authUser, error } = await this.supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm email for tests
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: userData.fullName
          }
        });
        
        if (error) {
          if (error.code === 'email_exists') {
            console.log(`ℹ️ Auth user ${userData.email} already exists, fetching...`);
            // User already exists, try to get the existing user
            const { data: existingUsers } = await this.supabaseAdmin.auth.admin.listUsers();
            const existingUser = existingUsers.users.find((u: any) => u.email === userData.email);
            
            if (existingUser) {
              authUsers.push({
                key,
                authId: existingUser.id,
                ...userData
              });
              console.log(`✅ Found existing auth user: ${userData.email}`);
            } else {
              throw new Error(`User ${userData.email} exists but could not be found`);
            }
          } else {
            console.error(`Failed to create auth user ${userData.email}:`, error);
            throw error;
          }
        } else {
          authUsers.push({
            key,
            authId: authUser.user.id,
            ...userData
          });
          console.log(`✅ Created auth user: ${userData.email}`);
        }
      } catch (error) {
        console.error(`❌ Failed to handle auth user ${userData.email}:`, error);
        throw error;
      }
    }
    
    return authUsers;
  }

  async createDbUsers(authUsers: any[]) {
    console.log('📝 Creating database users...');
    
    const dbUsers = [];
    
    for (const authUser of authUsers) {
      const dbUser = await this.prisma.user.create({
        data: {
          auth_id: authUser.authId,
          first_name: authUser.firstName,
          last_name: authUser.lastName,
          full_name: authUser.fullName,
          email: authUser.email,
          onboarding_completed_at: new Date(), // Complete onboarding for tests
          tutorial_completed: true
        }
      });
      
      dbUsers.push(dbUser);
      console.log(`✅ Created DB user: ${authUser.email} (ID: ${dbUser.id})`);
    }
    
    return dbUsers;
  }

  async createTestWorkspace(mainUser: any) {
    console.log('🏢 Creating test workspace...');
    
    const workspace = await this.prisma.workspace.create({
      data: {
        name: TEST_WORKSPACE.name,
        slug: TEST_WORKSPACE.slug,
        icon_url: TEST_WORKSPACE.iconUrl,
        background_colour: TEST_WORKSPACE.backgroundColour
      }
    });
    
    // Update main user's active workspace
    await this.prisma.user.update({
      where: { id: mainUser.id },
      data: { active_workspace_id: workspace.id }
    });
    
    console.log(`✅ Created workspace: ${workspace.name} (ID: ${workspace.id})`);
    return workspace;
  }

  async addUsersToWorkspace(workspaceId: number, users: any[]) {
    console.log('👥 Adding users to workspace...');
    
    for (const [index, user] of users.entries()) {
      const role = index === 0 ? 'ADMIN' : 'EDITOR'; // First user is admin, others are editors
      
      await this.prisma.user_workspace.create({
        data: {
          user_id: user.id,
          workspace_id: workspaceId,
          role: role
        }
      });
      
      console.log(`✅ Added ${user.email} as ${role}`);
    }
  }

  async createTestWorkflow(workspaceId: number, authorId: number) {
    console.log('📋 Creating test workflow...');
    
    const workflow = await this.prisma.workflow.create({
      data: {
        name: TEST_WORKFLOW.name,
        description: TEST_WORKFLOW.description,
        icon: TEST_WORKFLOW.icon,
        workspace_id: workspaceId,
        author_id: authorId,
        is_public: true,
        status: 'ACTIVE',
        public_access_id: `test-workflow-${Date.now()}`
      }
    });
    
    console.log(`✅ Created workflow: ${workflow.name} (ID: ${workflow.id})`);
    return workflow;
  }

  async createBasicWorkflowStructure(workflowId: number) {
    console.log('🔧 Creating basic workflow structure...');
    
    // Create main path
    const mainPath = await this.prisma.path.create({
      data: {
        name: 'Main Path',
        workflow_id: workflowId
      }
    });
    
    // Create BEGIN block
    const beginBlock = await this.prisma.block.create({
      data: {
        type: 'BEGIN',
        position: 0,
        title: 'Start',
        description: 'Beginning of the test workflow',
        workflow_id: workflowId,
        path_id: mainPath.id
      }
    });
    
    // Create a STEP block
    const stepBlock = await this.prisma.block.create({
      data: {
        type: 'STEP',
        position: 1,
        title: 'Test Step',
        description: 'A test step for E2E testing',
        workflow_id: workflowId,
        path_id: mainPath.id
      }
    });
    
    // Create END block
    const endBlock = await this.prisma.block.create({
      data: {
        type: 'END',
        position: 2,
        title: 'End',
        description: 'End of the test workflow',
        workflow_id: workflowId,
        path_id: mainPath.id
      }
    });
    
    console.log(`✅ Created workflow structure: BEGIN → STEP → END`);
    
    return {
      path: mainPath,
      blocks: {
        begin: beginBlock,
        step: stepBlock,
        end: endBlock
      }
    };
  }

  async close() {
    await this.prisma.$disconnect();
  }
}

// CLI execution
async function main() {
  const seeder = new TestDataSeeder();
  
  try {
    const result = await seeder.seedTestData();
    
    // Write test data info to a file for CI/test scripts
    const testDataInfo = {
      seededAt: new Date().toISOString(),
      users: result.credentials,
      workspace: {
        id: result.workspace.id,
        slug: result.workspace.slug,
        name: result.workspace.name
      },
      workflow: {
        id: result.workflow.id,
        name: result.workflow.name
      },
      urls: {
        login: 'http://localhost:3000/login',
        editor: `/workspace/${result.workspace.id}/${result.workflow.name.toLowerCase().replace(/\s+/g, '-')}--pf-${result.workflow.id}/edit`
      }
    };
    
    // Save to file for test consumption
    require('fs').writeFileSync(
      'e2e/test-data.json', 
      JSON.stringify(testDataInfo, null, 2)
    );
    
    console.log('📄 Test data info saved to e2e/test-data.json');
    
  } finally {
    await seeder.close();
  }
}

// Export for programmatic use
export { TestDataSeeder, TEST_USERS, TEST_WORKSPACE, TEST_WORKFLOW };

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}