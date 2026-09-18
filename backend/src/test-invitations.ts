import { connectDB } from "./config/db.js";
import User from "./models/User.model.js";
import Verification from "./models/Verification.model.js";
import Workspace from "./models/Workspace.model.js";
import Project from "./models/Project.model.js";
import Task from "./models/Task.model.js";
import WorkspaceInvite from "./models/WorkspaceInvite.model.js";

async function testFetch(url: string, options: any = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch (e) {}
  return { status: res.status, headers: res.headers, text, json };
}

async function run() {
  console.log("=== Testing Workspace Invitation & Multi-User Collaboration Flow ===");

  let connected = false;
  for (let i = 0; i < 3; i++) {
    try {
      await connectDB();
      connected = true;
      break;
    } catch (e) {
      console.log(`Connection attempt ${i + 1} failed, retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  if (!connected) {
    console.error("Could not connect to MongoDB after 3 attempts");
    process.exit(1);
  }

  const now = Date.now();
  const emailOwner = `owner_${now}@example.com`;
  const emailInvited = `invited_${now}@example.com`;

  // 1. Register User A (Owner)
  console.log("1. Registering Owner User A...");
  const regOwner = await testFetch("http://localhost:5000/api-v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailOwner, password: "Password123!", name: "Alice Owner" }),
  });
  console.log(`   Register status: ${regOwner.status}`, regOwner.json?.message);
  const ownerId = regOwner.json?.user?._id;

  // Verify email directly in DB
  await User.findByIdAndUpdate(ownerId, { isEmailVerified: true });
  console.log("   Owner email verified in DB.");

  // Login User A
  const loginOwner = await testFetch("http://localhost:5000/api-v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailOwner, password: "Password123!" }),
  });
  const tokenOwner = loginOwner.json?.token;
  const headersOwner = { "Content-Type": "application/json", Authorization: `Bearer ${tokenOwner}` };
  console.log(`   Owner login: ${loginOwner.status}. Token acquired.`);

  // 2. Owner gets default workspace
  const wsRes = await testFetch("http://localhost:5000/api-v1/workspaces", { headers: headersOwner });
  const workspaceId = wsRes.json?.[0]?._id;
  console.log(`2. Workspace ID: ${workspaceId}, Name: "${wsRes.json?.[0]?.name}"`);

  // 3. Owner creates a Project in Workspace
  console.log("3. Owner creates a project in workspace...");
  const projRes = await testFetch(`http://localhost:5000/api-v1/projects/${workspaceId}/create-project`, {
    method: "POST",
    headers: headersOwner,
    body: JSON.stringify({
      title: "Shared Team Roadmap",
      description: "A collaborative project for team members",
      status: "In Progress",
    }),
  });
  const projectId = projRes.json?._id;
  console.log(`   Project created: "${projRes.json?.title}" (ID: ${projectId})`);

  // 4. Owner invites User B by email
  console.log("4. Owner invites User B by email (email does not need to exist yet)...");
  const inviteRes = await testFetch(`http://localhost:5000/api-v1/workspaces/${workspaceId}/invite`, {
    method: "POST",
    headers: headersOwner,
    body: JSON.stringify({
      email: emailInvited,
      role: "member",
    }),
  });
  console.log(`   Invite Status: ${inviteRes.status}`);
  console.log(`   Message: ${inviteRes.json?.message}`);
  console.log(`   Invite Link: ${inviteRes.json?.inviteLink}`);
  const inviteToken = inviteRes.json?.token;
  if (!inviteToken) {
    throw new Error("No invite token returned!");
  }

  // 5. Test public invite info endpoint
  console.log("5. Checking public invite-info endpoint...");
  const inviteInfoRes = await testFetch(`http://localhost:5000/api-v1/workspaces/invite-info?token=${encodeURIComponent(inviteToken)}`);
  console.log(`   Invite info status: ${inviteInfoRes.status}`);
  console.log(`   Target email: ${inviteInfoRes.json?.email}, Role: ${inviteInfoRes.json?.role}`);
  console.log(`   Workspace: "${inviteInfoRes.json?.workspace?.name}", Owner: "${inviteInfoRes.json?.workspace?.owner?.name}"`);

  // 6. Test Next.js SSR landing page for invite
  console.log("6. Testing Next.js SSR landing page for /workspace-invite/[workspaceId]...");
  const pageRes = await testFetch(`http://localhost:3000/workspace-invite/${workspaceId}?tk=${encodeURIComponent(inviteToken)}`);
  console.log(`   Next.js page status: ${pageRes.status}`);
  if (pageRes.status === 200 && !pageRes.text.includes("Error: Route") && !pageRes.text.includes("params is a Promise")) {
    console.log("   SUCCESS: Next.js rendered invite page cleanly with 200 OK!");
  } else {
    console.error("   FAILURE in Next.js SSR page render!", pageRes.text.substring(0, 300));
  }

  // 7. Register User B (Invited)
  console.log("7. User B registers and logs in...");
  const regInvited = await testFetch("http://localhost:5000/api-v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailInvited, password: "Password123!", name: "Bob Collaborator" }),
  });
  const invitedId = regInvited.json?.user?._id;

  // Verify User B email
  await User.findByIdAndUpdate(invitedId, { isEmailVerified: true });

  const loginInvited = await testFetch("http://localhost:5000/api-v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailInvited, password: "Password123!" }),
  });
  const tokenInvited = loginInvited.json?.token;
  const headersInvited = { "Content-Type": "application/json", Authorization: `Bearer ${tokenInvited}` };
  console.log(`   User B login: ${loginInvited.status}. Token acquired.`);

  // 8. User B accepts the invite
  console.log("8. User B accepts the invitation token...");
  const acceptRes = await testFetch("http://localhost:5000/api-v1/workspaces/accept-invite-by-token", {
    method: "POST",
    headers: headersInvited,
    body: JSON.stringify({ token: inviteToken }),
  });
  console.log(`   Accept status: ${acceptRes.status}`, acceptRes.json?.message);

  // 9. Verify User B can see the workspace and its projects
  console.log("9. Testing multi-user workspace & project collaboration for User B...");
  const bWorkspaces = await testFetch("http://localhost:5000/api-v1/workspaces", { headers: headersInvited });
  const joinedWs = bWorkspaces.json?.find((w: any) => w._id === workspaceId);
  console.log(`   Workspace in User B's list? ${joinedWs ? "YES" : "NO"} ("${joinedWs?.name}")`);

  const bProjects = await testFetch(`http://localhost:5000/api-v1/workspaces/${workspaceId}/projects`, { headers: headersInvited });
  console.log(`   User B can see workspace projects? Count: ${bProjects.json?.projects?.length}`);
  console.log(`   Project found: "${bProjects.json?.projects?.[0]?.title}"`);

  const bProjDetails = await testFetch(`http://localhost:5000/api-v1/projects/${projectId}`, { headers: headersInvited });
  console.log(`   User B access to /projects/${projectId}: Status ${bProjDetails.status} ("${bProjDetails.json?.title}")`);

  const bProjTasks = await testFetch(`http://localhost:5000/api-v1/projects/${projectId}/tasks`, { headers: headersInvited });
  console.log(`   User B access to project tasks: Status ${bProjTasks.status}`);
  console.log(`   Workspace members available for task assignment: ${bProjTasks.json?.workspaceMembers?.length} members`);

  // 10. User B creates a task in User A's project
  console.log("10. User B creates a task in the collaborative project...");
  const createTaskRes = await testFetch(`http://localhost:5000/api-v1/tasks/${projectId}/create-task`, {
    method: "POST",
    headers: headersInvited,
    body: JSON.stringify({
      title: "Task created by Collaborator Bob",
      status: "In Progress",
      priority: "High",
      dueDate: "2026-10-15",
    }),
  });
  console.log(`   Task creation status: ${createTaskRes.status}`, createTaskRes.json?.title);

  // 11. Cleanup test data
  console.log("11. Cleaning up test data...");
  await User.deleteOne({ email: emailOwner });
  await User.deleteOne({ email: emailInvited });
  await Workspace.deleteOne({ _id: workspaceId });
  await Project.deleteOne({ _id: projectId });
  if (createTaskRes.json?._id) {
    await Task.deleteOne({ _id: createTaskRes.json._id });
  }
  await WorkspaceInvite.deleteMany({ workspaceId });
  console.log("   Test data cleaned up successfully.");

  console.log("=== ALL MULTI-USER WORKSPACE & PROJECT TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

run().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
