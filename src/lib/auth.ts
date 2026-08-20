import { useCallback, useEffect, useState } from "react";
import { portalStudents, type PortalStudent } from "@/data/site";
import { supabase } from "@/lib/supabase";
const SESSION_KEY = "aeia.session";
const ADMIN_KEY = "aeia.admin";
/** Demo-only credentials. Replace with a real backend session when connected. */
const ADMIN_PASSCODE = "aeia-admin-2026";

export type Session = { studentId: string; issuedAt: number };
/** Sessions expire after 2 hours of wall-clock time. */
const SESSION_TTL = 1000 * 60 * 60 * 2;

function readSession(): Session | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (Date.now() - parsed.issuedAt > SESSION_TTL) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useStudentAuth() {
  const [student, setStudent] = useState<PortalStudent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (session) {
      const found = portalStudents.find((s) => s.studentId === session.studentId);
      setStudent(found ?? null);
    }
    setReady(true);
  }, []);

  const login = useCallback((studentId: string, password: string) => {
    const found = portalStudents.find(
      (s) => s.studentId.toLowerCase() === studentId.trim().toLowerCase() && s.password === password,
    );
    if (!found) return false;
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ studentId: found.studentId, issuedAt: Date.now() } satisfies Session),
    );
    setStudent(found);
    return true;
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setStudent(null);
  }, []);

  return { student, ready, login, logout } as const;
}

export function useAdminAuth() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  const checkAdmin = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthed(false);
      return false;
    }

    const { data: profile, error } = await supabase
      .from("admin_profiles")
      .select("role, is_active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Admin profile check failed:",
        error,
      );

      setAuthed(false);
      return false;
    }

    const isAdmin =
      profile?.role === "admin" &&
      profile?.is_active === true;

    setAuthed(isAdmin);

    return isAdmin;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;

      await checkAdmin();

      if (mounted) {
        setReady(true);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (!session) {
          setAuthed(false);
          setReady(true);
          return;
        }

        await checkAdmin();

        if (mounted) {
          setReady(true);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error(
          "Admin login error:",
          error,
        );

        return false;
      }

      const isAdmin = await checkAdmin();

      if (!isAdmin) {
        await supabase.auth.signOut({
          scope: "local",
        });

        return false;
      }

      return true;
    },
    [checkAdmin],
  );

  const logout = useCallback(async () => {
    const { error } =
      await supabase.auth.signOut({
        scope: "local",
      });

    if (error) {
      console.error(
        "Admin logout error:",
        error,
      );
      return;
    }

    setAuthed(false);
  }, []);

  return {
    authed,
    ready,
    login,
    logout,
  } as const;
}
