export async function notifyDiscord(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return { skipped: true };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "CR Store",
      content,
    }),
  });
  return { skipped: false, ok: res.ok };
}
