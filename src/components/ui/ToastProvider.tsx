"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; text: string };
const Ctx = createContext<{ push: (text: string) => void }>({ push: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 end-4 z-[80] space-y-2">
        {items.map((t) => (
          <div key={t.id} className="glass rounded-xl px-4 py-3 text-sm shadow-xl">{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
