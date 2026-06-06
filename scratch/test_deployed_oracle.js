const SUPABASE_URL = "https://oorlsqxfwhozmciktljf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcmxzcXhmd2hvem1jaWt0bGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjgyMDIsImV4cCI6MjA5NTkwNDIwMn0.LyyeYMpg1WFX6fsx_VY1qdy_qeO29luRlc12ZojAG2s";
const TEST_EMAIL = "test_oracle_gemini_" + Math.random().toString(36).substring(7) + "@test.com";
const TEST_PASSWORD = "testpassword123";

async function runTest() {
  console.log("Creating test user:", TEST_EMAIL);
  
  // 1. Sign up user via GoTrue API
  const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });
  
  if (!signUpRes.ok) {
    const errorText = await signUpRes.text();
    throw new Error("Sign up failed: " + errorText);
  }
  
  const signUpData = await signUpRes.json();
  const userId = signUpData.id;
  console.log("User created in Auth. ID:", userId);

  // 2. Sign in to get access token (JWT)
  console.log("Signing in...");
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });
  
  if (!signInRes.ok) {
    throw new Error("Sign in failed: " + await signInRes.text());
  }
  
  const signInData = await signInRes.json();
  const token = signInData.access_token;
  console.log("JWT Token retrieved successfully.");

  // 3. Insert user profile via SQL MCP tool (since we have SQL access)
  // Let's do it directly in SQL from Node or we'll run SQL through execute_sql next.
  // Wait, let's export a database update command that we will run right after this script or let this script call our SQL?
  // We can just run the SQL in Node using the Service role key if we had it, but since we don't, we will create the profile manually by SQL BEFORE calling this script, or we'll let this script pause and we execute SQL.
  // Wait! The client-side app inserts the profile into public.astrology_profiles when signing up!
  // In our project, does Supabase have a trigger that automatically inserts an astrology profile, or does the client do it?
  // The client does it. But since we are testing, let's write the SQL statement from our MCP tool first to make this user premium!
  return { userId, token };
}

runTest().then(res => console.log("STEP_1_RESULT:" + JSON.stringify(res))).catch(console.error);
