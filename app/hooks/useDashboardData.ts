"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Task, KPI } from "../types/dashboard";

type MilestoneConfig = {
  registrationDate: string;
  mainEventDate: string;
};

const DEFAULT_MILESTONES: MilestoneConfig = {
  registrationDate: "2026-06-08",
  mainEventDate: "2026-09-24",
};

function loadMilestones(): MilestoneConfig {
  if (typeof window === "undefined") return DEFAULT_MILESTONES;
  try {
    const stored = localStorage.getItem("catalyst_milestones");
    if (stored) return { ...DEFAULT_MILESTONES, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_MILESTONES;
}

function saveMilestones(config: MilestoneConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("catalyst_milestones", JSON.stringify(config));
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
    setMilestones(loadMilestones());

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

  const updateMilestone = (field: "registration" | "mainEvent", value: string) => {
    const updated = {
      ...milestones,
      [field === "registration" ? "registrationDate" : "mainEventDate"]: value,
    };
    setMilestones(updated);
    saveMilestones(updated);
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
