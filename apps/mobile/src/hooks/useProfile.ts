import type { NiveauActivite, ObjectifType, Sexe } from "@assiettly/shared";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/client";

export interface Goal {
  id: string;
  objectifCaloriesKcal: number;
  objectifProteinesG: number;
  objectifGlucidesG: number;
  objectifLipidesG: number;
  tolerancePct: number;
}

export interface StreakSummary {
  streakActuel: number;
  streakMax: number;
}

export interface Profile {
  id: string;
  email: string;
  nom: string | null;
  dateNaissance: string | null;
  sexe: Sexe | null;
  tailleCm: number | null;
  niveauActivite: NiveauActivite | null;
  objectifType: ObjectifType | null;
  goals: Goal[];
  streakSummary: StreakSummary | null;
}

export function estOnboardingComplet(profile: Profile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.sexe && profile.dateNaissance && profile.tailleCm && profile.niveauActivite && profile.objectifType,
  );
}

export function useProfile(enabled: boolean) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Profile>("/me");
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      refresh();
    } else {
      setProfile(null);
    }
  }, [enabled, refresh]);

  return { profile, loading, refresh };
}
