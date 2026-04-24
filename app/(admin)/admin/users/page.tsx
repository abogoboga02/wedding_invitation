import { connection } from "next/server";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { prisma } from "@/lib/db/prisma";
import { formatAdminDateTime } from "@/lib/utils/date";

import { updateUserRoleAction } from "../_actions/admin-actions";
import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminUsersPage() {
  await connection();

  const users = await prisma.user.findMany({
    include: {
      invitation: {
        select: {
          id: true,
          coupleSlug: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="User Management"
        description="Admin bisa memantau akun yang baru masuk, melihat invitation milik mereka, dan mengganti role bila diperlukan."
      >
        <div className="space-y-4">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-[1.7rem] bg-[var(--color-surface-alt)] px-4 py-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {user.name ?? "Tanpa nama"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{user.email}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Invitation: {user.invitation?.coupleSlug ?? "Belum ada"} | Status{" "}
                    {user.invitation?.status ?? "-"} | Dibuat {formatAdminDateTime(user.createdAt)}
                  </p>
                </div>

                <form action={updateUserRoleAction} className="flex items-center gap-3">
                  <input type="hidden" name="userId" value={user.id} />
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <SubmitButton className="rounded-full bg-[var(--color-text-primary)] px-4 py-2.5 text-sm font-semibold text-white">
                    Simpan
                  </SubmitButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
