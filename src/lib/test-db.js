const { createClient } = require("@supabase/supabase-js");

const url = "https://thliayuotoagfjkzxorl.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobGlheXVvdG9hZ2Zqa3p4b3JsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI0MzQzOSwiZXhwIjoyMDk3ODE5NDM5fQ.VUv9atghRDAGZP-cF3WY-FYAvgD-h4coKNjjpQSP6Rc";

const client = createClient(url, serviceKey);

async function test() {
  const excoId = '24b1112b-d015-4117-beb8-3ea5fa81002b'; // super_admin user id
  const { data: announcement, error } = await client
    .from("announcements")
    .insert({
      title: "Test Announcement",
      body: "This is a test announcement body",
      organ: null,
      is_published: true,
      published_at: new Date().toISOString(),
      created_by: excoId,
    })
    .select()
    .single();

  console.log("Insert result:", announcement);
  if (error) console.error("Insert error:", error);
}

test();
