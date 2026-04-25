import { connection } from "next/server";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { getAdminUsers } from "@/features/admin/admin.service";
import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";
import { formatAdminDateTime } from "@/lib/utils/date";

import {
  createClientFromAdminAction,
  updateClientTemplateAction,
  updateUserRoleAction,
} from "../_actions/admin-actions";
import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminUsersPage() {
  await connection();
  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Tambah Client"
        description="Admin menentukan template saat membuat akun client baru. Template ini jadi template aktif awal di dashboard client."
      >
        <form action={createClientFromAdminAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            required
            name="name"
            placeholder="Nama client"
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="email@contoh.com"
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
          />
          <input
            required
            minLength={8}
            type="password"
            name="password"
            placeholder="Password minimal 8 karakter"
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
          />
          <select
            name="template"
            defaultValue={TEMPLATE_OPTIONS[0]?.id}
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
          >
            {TEMPLATE_OPTIONS.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
          <div className="md:col-span-2 xl:col-span-4">
            <SubmitButton className="rounded-full bg-[var(--color-text-primary)] px-5 py-2.5 text-sm font-semibold text-white">
              Buat Client + Tentukan Template
            </SubmitButton>
          </div>
        </form>
      </AdminSectionCard>

      <AdminSectionCard
        title="User Management"
        description="Admin bisa memantau akun yang baru masuk, melihat invitation milik mereka, mengganti role, dan mengganti template khusus client."
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
                    {user.invitation?.status ?? "-"} | Template{" "}
                    {user.invitation?.templateName ?? user.invitation?.template ?? "-"} | Dibuat{" "}
                    {formatAdminDateTime(user.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
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
                      Simpan Role
                    </SubmitButton>
                  </form>

                  {user.role === "CLIENT" && user.invitation ? (
                    <form action={updateClientTemplateAction} className="flex items-center gap-3">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="template"
                        defaultValue={user.invitation.template}
                        className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
                      >
                        {TEMPLATE_OPTIONS.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.label}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className="rounded-full bg-[var(--color-text-primary)] px-4 py-2.5 text-sm font-semibold text-white">
                        Ganti Template Client
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
