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
  // Try fetching timeline data, fallback if order_index is not supported on older schemas
  let events = [];
  try {
    const { data } = await supabase
      .from("catalyst_timeline")
      .select("*")
      .order("order_index", { ascending: true });
    events = data || [];
  } catch (e) {
    try {
      const { data } = await supabase
        .from("catalyst_timeline")
        .select("*")
        .order("created_at", { ascending: true });
      events = data || [];
    } catch {
      events = [];
    }
  }

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
