import { supabase } from "@/lib/supabase";
import TimelineView from "@/components/TimelineView";

export const revalidate = 0; // Disable caching for dynamic data

type TimelineEvent = {
  id: string;
  phase: string;
  date_range: string;
  type: string;
  description: string;
  order_index: number;
};

export default async function TimelinePage() {
  let events = [];
  const { data, error } = await supabase
    .from("catalyst_timeline")
    .select("*")
    .order("order_index", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("Timeline fetch error:", error);
    const { data: fallback } = await supabase
      .from("catalyst_timeline")
      .select("*");
    events = fallback || [];
  } else {
    events = data || [];
  }
  console.log("Timeline events count:", events.length, "IDs:", events.map(e => e.id));

  let tasks = [];
  try {
    const { data } = await supabase
      .from("catalyst_tasks")
      .select("*");
    tasks = data || [];
  } catch (e) {
    tasks = [];
  }

  return <TimelineView initialEvents={events} initialTasks={tasks} />;
}
