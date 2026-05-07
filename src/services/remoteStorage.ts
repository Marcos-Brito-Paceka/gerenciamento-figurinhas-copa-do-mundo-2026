import type { User } from "@supabase/supabase-js";
import type { AppPreferences, StickerStatus, Team } from "../types/album";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

export { isSupabaseConfigured } from "./supabaseClient";

export type RemoteSnapshot = {
  progress: {
    id: string;
    stickers: {
      number: string;
      status: StickerStatus;
    }[];
  }[];
  preferences: AppPreferences;
  ui: {
    selectedTeamIndex: number;
  };
};

type AlbumProgressRow = {
  progress: RemoteSnapshot["progress"];
  preferences: RemoteSnapshot["preferences"];
  ui: RemoteSnapshot["ui"];
};

export type AuthState = {
  configured: boolean;
  user: User | null;
};

export function buildRemoteSnapshot(
  teams: Team[],
  preferences: AppPreferences,
  selectedTeamIndex: number,
): RemoteSnapshot {
  return {
    progress: teams.map((team) => ({
      id: team.id,
      stickers: team.stickers.map((sticker) => ({
        number: sticker.number,
        status: sticker.status,
      })),
    })),
    preferences,
    ui: {
      selectedTeamIndex,
    },
  };
}

export function applyRemoteSnapshot(
  teams: Team[],
  snapshot: RemoteSnapshot,
): void {
  snapshot.progress.forEach((savedTeam) => {
    const team = teams.find((item) => item.id === savedTeam.id);

    if (!team) return;

    savedTeam.stickers.forEach((savedSticker) => {
      const sticker = team.stickers.find(
        (item) => item.number === savedSticker.number,
      );

      if (sticker) {
        sticker.status = savedSticker.status;
      }
    });
  });
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
      scopes: "openid email profile https://www.googleapis.com/auth/userinfo.email",
    },
  });

  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loadRemoteSnapshot(
  userId: string,
): Promise<RemoteSnapshot | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("album_progress")
    .select("progress, preferences, ui")
    .eq("user_id", userId)
    .maybeSingle<AlbumProgressRow>();

  if (error) throw error;
  if (!data) return null;

  return {
    progress: data.progress,
    preferences: data.preferences,
    ui: data.ui,
  };
}

export async function saveRemoteSnapshot(
  userId: string,
  snapshot: RemoteSnapshot,
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from("album_progress").upsert(
    {
      user_id: userId,
      progress: snapshot.progress,
      preferences: snapshot.preferences,
      ui: snapshot.ui,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) throw error;
}

export function onAuthChange(callback: (state: AuthState) => void): () => void {
  if (!supabase) {
    callback({ configured: isSupabaseConfigured, user: null });
    return () => undefined;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback({ configured: true, user: session?.user ?? null });
  });

  return () => data.subscription.unsubscribe();
}
