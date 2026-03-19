import { useState } from "react";
import type { User } from "../backend.d";

const STORAGE_KEY = "cricfluence_user";

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Restore bigint id
    if (parsed && typeof parsed.id === "string") {
      parsed.id = BigInt(parsed.id);
    }
    return parsed as User;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    // Serialize bigint as string
    const serializable = { ...user, id: user.id.toString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }
}

export function useUserAuth() {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const login = (u: User) => {
    storeUser(u);
    setUser(u);
  };

  const logout = () => {
    storeUser(null);
    setUser(null);
  };

  return { user, login, logout };
}
