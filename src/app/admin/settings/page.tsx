import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="display mb-6 text-3xl">Store settings</h1>
      <SettingsForm settings={s} />
    </div>
  );
}
