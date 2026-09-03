"use client";
import { useRouter } from "next/navigation";
export function LogoutButton() {
  const router = useRouter();
  return (
    <button className="btn-ghost rounded-full px-5 py-2" onClick={async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    }}>Logout</button>
  );
}
