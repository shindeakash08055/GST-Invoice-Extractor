import { createBrowserSupabaseClient } from "@/lib/supabase-client";

const supabase = createBrowserSupabaseClient();
const { data: profile } = await supabase
  .from("profiles")
  .select("*");
  
import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  return <DashboardClient />;
}
