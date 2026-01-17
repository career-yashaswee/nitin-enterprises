"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authService } from "../services/auth.service";
import type { UserRole } from "../types";
import { useRouter, usePathname } from "next/navigation";

export function useAuth() {
  const { user, role, setUser, setRole, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      // Get role from user metadata or fetch from database
      const userRole = session.user.user_metadata?.role as UserRole;
      if (userRole) {
        setRole(userRole);
      } else {
        // Fetch role from database
        authService.getUserRole(session.user.id).then(setRole);
      }
    } else {
      clearAuth();
    }
  }, [session, setUser, setRole, clearAuth]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userRole = session.user.user_metadata?.role as UserRole;
        if (userRole) {
          setRole(userRole);
        } else {
          authService.getUserRole(session.user.id).then(setRole);
        }
      } else {
        clearAuth();
        // Only redirect to login if we're not already on an auth page
        const isAuthPage = pathname === "/login" || pathname === "/signup";
        if (!isAuthPage) {
          router.push("/login");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setRole, clearAuth, router, pathname]);

  const signInMutation = useMutation({
    mutationFn: authService.signIn,
    onSuccess: () => {
      router.push("/");
    },
  });

  const signUpMutation = useMutation({
    mutationFn: authService.signUp,
    onSuccess: () => {
      router.push("/");
    },
  });

  const signOutMutation = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      clearAuth();
      router.push("/login");
    },
  });

  return {
    user,
    role,
    isAuthenticated: !!user,
    isLoading: !session,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
}
