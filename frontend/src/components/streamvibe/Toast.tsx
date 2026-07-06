import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2800);
  }
  return { toast, showToast };
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div className={`toast${message ? " show" : ""}`}>{message ?? ""}</div>
  );
}
