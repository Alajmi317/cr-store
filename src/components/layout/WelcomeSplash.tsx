"use client";

import { useEffect, useState } from "react";

export function WelcomeSplash({ locale }: { locale: "ar" | "en" }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("cr_welcome_seen");
    if (!seen) setOpen(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (open && !hiding) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, hiding]);

  function enter() {
    setHiding(true);
    window.setTimeout(() => {
      sessionStorage.setItem("cr_welcome_seen", "1");
      setOpen(false);
    }, 800);
  }

  if (!ready || !open) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-end transition-opacity duration-800 ease-out ${
        hiding ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <img
        src="/brand/welcome.jpg"
        alt="CR Store"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 mb-16 px-6 text-center">
        <button
          type="button"
          onClick={enter}
          className="btn-primary rounded-full px-10 py-4 text-base tracking-wide"
        >
          {locale === "ar" ? "الدخول للموقع" : "Enter the store"}
        </button>
      </div>
    </div>
  );
}
