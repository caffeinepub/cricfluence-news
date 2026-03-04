import { useState } from "react";

const KEY = "admin_authed";

export function useAdminAuth() {
  const [authed, setAuthedState] = useState(
    () => sessionStorage.getItem(KEY) === "true",
  );

  const setAuthed = (value: boolean) => {
    if (value) sessionStorage.setItem(KEY, "true");
    else sessionStorage.removeItem(KEY);
    setAuthedState(value);
  };

  const logout = () => setAuthed(false);

  return { authed, setAuthed, logout };
}
