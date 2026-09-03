import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { saveSettings } from "@/lib/settings";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "OWNER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const allowed = [
    "storeName", "storeLogo", "favicon", "storeDescription", "storeDescriptionAr",
    "heroTitle", "heroTitleAr", "heroDescription", "heroDescriptionAr", "heroImage",
    "announcement", "announcementAr", "announcementEnabled", "footerText", "footerTextAr",
    "contactEmail", "contactDiscord", "socialTwitter", "socialYoutube", "socialDiscord",
    "taxEnabled", "taxRate",
  ];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  const next = await saveSettings(patch);
  return NextResponse.json(next);
}
