import type { Task, KPI, ProjectStatus, WeeklyPriority, BlockedTask } from "../types/dashboard";

export function getIncompleteTasks(tasks: Task[]) {
  return tasks.filter((t) => t.status !== "Done");
}

export function getBlockedTasks(tasks: Task[]): BlockedTask[] {
  return tasks
    .filter((t) => t.blocker && t.blocker.trim() !== "")
    .map((t) => ({
      id: t.id,
      name: t.name,
      workstream: t.workstream,
      blocker: t.blocker || "",
    }));
}

export function getWeeklyPriorities(incompleteTasks: Task[]): WeeklyPriority[] {
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };
  const sorted = [...incompleteTasks].sort((a, b) => {
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    if (weightB !== weightA) return weightB - weightA;
    return a.id.localeCompare(b.id);
  });

  return sorted.slice(0, 5).map((task, idx) => {
    let statusSuffix = "";
    if (task.status === "Blocked") statusSuffix = " · Blocked";
    else if (task.status === "Delayed") statusSuffix = " · Delayed";

    return {
      num: idx + 1,
      text: task.name,
      meta: `${task.deadline} · PIC: ${task.pic} · ${task.id}${statusSuffix}`,
    };
  });
}

export function getProjectStatus(tasks: Task[], incompleteTasks: Task[]): ProjectStatus {
  const isAtRisk = tasks.some((t) => t.status === "Blocked" || t.status === "Delayed");
  const isNeedsAttention = incompleteTasks.length > 0;

  if (isAtRisk) {
    return {
      label: "At Risk",
      desc: "Proposal sponsor & standardisasi dataset terhambat.",
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
      bullet: "bg-rose-500",
      badge: "text-rose-700 bg-rose-50 border-rose-100",
    };
  } else if (isNeedsAttention) {
    return {
      label: "Needs Attention",
      desc: `${incompleteTasks.length} tugas masih berjalan atau belum dimulai.`,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-200",
      bullet: "bg-indigo-500",
      badge: "text-indigo-700 bg-indigo-50 border-indigo-100",
    };
  } else {
    return {
      label: "On Track",
      desc: "Seluruh persiapan berjalan sempurna sesuai jadwal.",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      bullet: "bg-emerald-500",
      badge: "text-emerald-700 bg-emerald-50 border-emerald-100",
    };
  }
}

export function getKpiStatusStyle(status: string) {
  switch (status) {
    case "Done":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "At Risk":
      return "text-rose-600 bg-rose-50 border-rose-200";
    case "In Progress":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-zinc-550 bg-zinc-100 border-zinc-200";
  }
}

export function calculateKPIData(tasks: Task[]): KPI[] {
  // Sponsor Confirmed: T049, T051, T052, T053
  const sponsorTasks = tasks.filter((t) =>
    ["T049", "T051", "T052", "T053"].includes(t.id)
  );
  const sponsorDone = sponsorTasks.filter((t) => t.status === "Done").length;
  const sponsorProgress =
    sponsorTasks.length > 0
      ? Math.round((sponsorDone / sponsorTasks.length) * 100)
      : 0;
  const sponsorStatus = sponsorTasks.some((t) => t.status === "Blocked")
    ? "At Risk"
    : sponsorProgress === 100
    ? "Done"
    : sponsorProgress > 0
    ? "In Progress"
    : "Not Started";

  // Dataset Ready: T024, T025, T026, T027, T028
  const datasetTasks = tasks.filter((t) =>
    ["T024", "T025", "T026", "T027", "T028"].includes(t.id)
  );
  const datasetDone = datasetTasks.filter((t) => t.status === "Done").length;
  const datasetProgress =
    datasetTasks.length > 0
      ? Math.round((datasetDone / datasetTasks.length) * 100)
      : 0;
  const datasetStatus =
    datasetProgress === 100
      ? "Done"
      : datasetProgress > 0
      ? "In Progress"
      : "Not Started";

  // Document Ready: T006, T007, T008, T009, T028, T029, T031, T032, T033, T038, T039, T041
  const docTasks = tasks.filter((t) =>
    [
      "T006", "T007", "T008", "T009", "T028", "T029", "T031", "T032", "T033", "T038", "T039", "T041",
    ].includes(t.id)
  );
  const docDone = docTasks.filter((t) => t.status === "Done").length;
  const docProgress =
    docTasks.length > 0
      ? Math.round((docDone / docTasks.length) * 100)
      : 0;
  const docStatus =
    docProgress === 100
      ? "Done"
      : docProgress > 0
      ? "In Progress"
      : "Not Started";

  // Curated Teams: T011
  const curateTask = tasks.find((t) => t.id === "T011");
  const curateProgress = curateTask?.status === "Done" ? 100 : 0;
  const curateStatus = curateTask?.status || "Not Started";

  // Top Finalists: T043
  const finalistTask = tasks.find((t) => t.id === "T043");
  const finalistProgress = finalistTask?.status === "Done" ? 100 : 0;
  const finalistStatus = finalistTask?.status || "Not Started";

  // Key Visual Ready: T062
  const kvTask = tasks.find((t) => t.id === "T062");
  const kvProgress =
    kvTask?.status === "Done" ? 100 : kvTask?.status === "In Progress" ? 50 : 0;
  const kvStatus = kvTask?.status || "Not Started";

  // Landing Page Live: T065
  const lpTask = tasks.find((t) => t.id === "T065");
  const lpProgress = lpTask?.status === "Done" ? 100 : 0;
  const lpStatus = lpTask?.status || "Not Started";

  // Venue Requirement Confirmed: T054, T055
  const venueTasks = tasks.filter((t) => ["T054", "T055"].includes(t.id));
  const venueDone = venueTasks.filter((t) => t.status === "Done").length;
  const venueProgress =
    venueTasks.length > 0
      ? Math.round((venueDone / venueTasks.length) * 100)
      : 0;
  const venueStatus =
    venueProgress === 100
      ? "Done"
      : venueProgress > 0
      ? "In Progress"
      : "Not Started";

  return [
    {
      metric: "Sponsor Confirmed",
      target: "4 Partners",
      current: `${sponsorDone} Confirmed`,
      status: sponsorStatus,
      color:
        sponsorStatus === "At Risk"
          ? "text-rose-600 bg-rose-50 border-rose-200"
          : sponsorStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-blue-600 bg-blue-50 border-blue-200",
      progress: sponsorProgress,
    },
    {
      metric: "Dataset Ready",
      target: "5 Datasets",
      current: `${datasetDone}/5 Ready`,
      status: datasetStatus,
      color:
        datasetStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-blue-600 bg-blue-50 border-blue-200",
      progress: datasetProgress,
    },
    {
      metric: "Document Ready",
      target: "12 Docs",
      current: `${docDone}/12 Ready`,
      status: docStatus,
      color:
        docStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-blue-600 bg-blue-50 border-blue-200",
      progress: docProgress,
    },
    {
      metric: "Curated Teams",
      target: "50 Teams",
      current: curateStatus === "Done" ? "50 Teams" : "0 Teams",
      status: curateStatus,
      color:
        curateStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-zinc-550 bg-zinc-100 border-zinc-200",
      progress: curateProgress,
    },
    {
      metric: "Top Finalists",
      target: "10 Teams",
      current: finalistStatus === "Done" ? "10 Teams" : "0 Teams",
      status: finalistStatus,
      color:
        finalistStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-zinc-550 bg-zinc-100 border-zinc-200",
      progress: finalistProgress,
    },
    {
      metric: "Key Visual Ready",
      target: "1 Master Visual",
      current:
        kvStatus === "Done"
          ? "1 Master"
          : kvStatus === "In Progress"
          ? "In Progress"
          : "0",
      status: kvStatus,
      color:
        kvStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-blue-600 bg-blue-50 border-blue-200",
      progress: kvProgress,
    },
    {
      metric: "Landing Page Live",
      target: "Live Site",
      current: lpStatus === "Done" ? "Live" : "Offline",
      status: lpStatus,
      color:
        lpStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-zinc-550 bg-zinc-100 border-zinc-200",
      progress: lpProgress,
    },
    {
      metric: "Venue Confirmed",
      target: "BINUS Auditorium",
      current: venueStatus === "Done" ? "Confirmed" : "In Negotiation",
      status: venueStatus,
      color:
        venueStatus === "Done"
          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
          : "text-blue-600 bg-blue-50 border-blue-200",
      progress: venueProgress,
    },
  ];
}
