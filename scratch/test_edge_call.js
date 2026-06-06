const SUPABASE_URL = "https://oorlsqxfwhozmciktljf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcmxzcXhmd2hvem1jaWt0bGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjgyMDIsImV4cCI6MjA5NTkwNDIwMn0.LyyeYMpg1WFX6fsx_VY1qdy_qeO29luRlc12ZojAG2s";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/oracle-chat`;
const TEST_EMAIL = "test_oracle_gemini_active@test.com";
const TEST_PASSWORD = "testpassword123";

async function testEdgeCall() {
  console.log("Signing in as:", TEST_EMAIL);
  
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
  console.log("Fresh JWT Token retrieved.");

  console.log("Calling Edge Function at:", FUNCTION_URL);
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      message: "Quel est l'impact de ma Lune en Sagittaire et mon Ascendant Lion sur mes relations amoureuses ?",
      history: [],
      astrologyData: {
        blocker: "peur d'être vulnérable",
        gemstone: "Citrine",
        gemstoneDesc: "apporte la joie et la clarté",
        lifePath: "5"
      }
    })
  });

  console.log("Response Status:", response.status);
  const resData = await response.json();
  console.log("Response Body:", JSON.stringify(resData, null, 2));
}

testEdgeCall().catch(console.error);
