import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/ProfileForm";
export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) return null;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  return (
    <div className="container-cr py-12 max-w-xl">
      <h1 className="display mb-6 text-4xl">Profile</h1>
      <ProfileForm name={user.name} email={user.email} />
    </div>
  );
}
