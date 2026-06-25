"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Task, KPI } from "../types/dashboard";

type MilestoneConfig = {
  registrationDate: string;
  mainEventDate: string;
};

const DEFAULT_MILESTONES: MilestoneConfig = {
  registrationDate: "2026-07-27",
  mainEventDate: "2026-09-24",
};

function loadMilestonesLocal(): MilestoneConfig {
  if (typeof window === "undefined") return DEFAULT_MILESTONES;
  try {
    const stored = localStorage.getItem("catalyst_milestones");
    if (stored) return { ...DEFAULT_MILESTONES, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_MILESTONES;
}

function saveMilestonesLocal(config: MilestoneConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("catalyst_milestones", JSON.stringify(config));
}

async function loadMilestonesFromSupabase(): Promise<MilestoneConfig | null> {
  try {
    const { data, error } = await supabase
      .from("catalyst_config")
      .select("key, value")
      .in("key", ["registrationDate", "mainEventDate"]);
    if (error || !data || data.length === 0) return null;
    const cfg: Partial<MilestoneConfig> = {};
    data.forEach((row: { key: string; value: string }) => {
      if (row.key === "registrationDate") cfg.registrationDate = row.value;
      if (row.key === "mainEventDate") cfg.mainEventDate = row.value;
    });
    if (cfg.registrationDate && cfg.mainEventDate) return cfg as MilestoneConfig;
    return null;
  } catch {
    return null;
  }
}

async function saveMilestonesToSupabase(config: MilestoneConfig) {
  try {
    await supabase.from("catalyst_config").upsert([
      { key: "registrationDate", value: config.registrationDate },
      { key: "mainEventDate", value: config.mainEventDate },
    ]);
  } catch (e) {
    console.error("Failed to save milestones to Supabase:", e);
  }
}

export function useDashboardData() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneConfig>(DEFAULT_MILESTONES);

  useEffect(() => {
    setCurrentDate(new Date());
    // Set from localStorage immediately, then sync from Supabase
    const local = loadMilestonesLocal();
    setMilestones(local);
    loadMilestonesFromSupabase().then((remote) => {
      if (remote) {
        setMilestones(remote);
        saveMilestonesLocal(remote);
      }
    });

    async function fetchDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from("catalyst_tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);

        const { data: kpisData, error: kpisError } = await supabase
          .from("catalyst_kpis")
          .select("*")
          .order("id", { ascending: true });

        if (kpisError) throw kpisError;
        setKpis(kpisData && kpisData.length > 0 ? kpisData : []);
      } catch (e) {
        console.error("Supabase fetch failed:", e);
        setError(e instanceof Error ? e.message : "Failed to fetch data");
        setTasks([]);
        setKpis([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formattedToday = useMemo(() => {
    if (!currentDate) return "Loading Date...";
    return currentDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  const daysToMilestone = useMemo(() => {
    if (!currentDate) return 0;
    const target = new Date(milestones.registrationDate + "T00:00:00");
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [currentDate, milestones.registrationDate]);

  const daysToMainEvent = useMemo(() => {
    if (!currentDate) return 0;
    const target = new Date(milestones.mainEventDate + "T00:00:00");
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [currentDate, milestones.mainEventDate]);

  const updateMilestone = (field: "mainEvent", value: string) => {
    const updated = {
      ...milestones,
      mainEventDate: value,
    };
    setMilestones(updated);
    saveMilestonesLocal(updated);
    saveMilestonesToSupabase(updated);
  };

  return {
    tasks,
    kpis,
    isLoading,
    error,
    formattedToday,
    daysToMilestone,
    daysToMainEvent,
    registrationDate: milestones.registrationDate,
    mainEventDate: milestones.mainEventDate,
    updateMilestone,
    setKpis,
  };
}
