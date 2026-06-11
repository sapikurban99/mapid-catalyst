export type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Waiting Review"
  | "Blocked"
  | "Done"
  | "Delayed";

export type Priority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  name: string;
  workstream: string;
  pic: string;
  priority: Priority;
  start_date?: string;
  deadline: string;
  status: TaskStatus;
  dependency?: string;
  blocker?: string;
  notes?: string;
  created_at?: string;
}

export interface KPI {
  id?: number;
  metric: string;
  target: string;
  current: string;
  status: string;
  progress: number;
  color?: string;
}

export interface ProjectStatus {
  label: string;
  desc: string;
  color: string;
  bg: string;
  bullet: string;
  badge: string;
}

export interface BlockedTask {
  id: string;
  name: string;
  workstream: string;
  blocker: string;
}

export interface WeeklyPriority {
  num: number;
  text: string;
  meta: string;
}
