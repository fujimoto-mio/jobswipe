"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCachedClientSession } from "@/lib/auth/client-session";
import { getProfile, subscribeProfileUpdates, type StoredProfile } from "@/lib/profile";
import { fetchSeekerMe, syncSeekerProfileFromMe } from "@/lib/seeker-user";

type SeekerUserContextValue = {
  profile: StoredProfile | null;
  ready: boolean;
  loggedIn: boolean;
  refresh: () => Promise<void>;
};

const SeekerUserContext = createContext<SeekerUserContextValue | null>(null);

export function SeekerUserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StoredProfile | null>(() => getProfile());
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const refresh = useCallback(async () => {
    const data = await fetchSeekerMe();
    if (data) {
      setProfile(syncSeekerProfileFromMe(data));
    }
  }, []);

  useEffect(() => {
    return subscribeProfileUpdates((next) => {
      setProfile(next);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cached = getProfile();
      if (cached) setProfile(cached);

      const sessionLoggedIn = await getCachedClientSession();
      if (!cancelled) setLoggedIn(sessionLoggedIn);

      if (!sessionLoggedIn) {
        if (!cancelled) setReady(true);
        return;
      }

      const data = await fetchSeekerMe();
      if (!cancelled && data) {
        setProfile(syncSeekerProfileFromMe(data));
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SeekerUserContext.Provider value={{ profile, ready, loggedIn, refresh }}>
      {children}
    </SeekerUserContext.Provider>
  );
}

export function useSeekerUser(): SeekerUserContextValue {
  const ctx = useContext(SeekerUserContext);
  if (!ctx) {
    throw new Error("useSeekerUser must be used within SeekerUserProvider");
  }
  return ctx;
}
