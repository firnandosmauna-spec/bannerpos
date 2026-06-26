import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uznrwhvczihnrzmlcrif.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnJ3aHZjemlobnJ6bWxjcmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDgzODMsImV4cCI6MjA4NDM4NDM4M30.r-ZO80J7jMTLO6n3Hy40fP5jiYIFcyE5Sl3xry2znIg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  const { data, error } = await supabase.from("products").select("category").limit(100);
  if (error) {
    console.error(error);
    return;
  }
  const categories = [...new Set(data.map(d => d.category))];
  console.log("Categories found:", categories);
}

checkData();
