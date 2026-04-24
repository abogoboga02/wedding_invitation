type InvitationStatusBadgeProps = {
  status: "DRAFT" | "PUBLISHED";
};

export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps) {
  const classes =
    status === "PUBLISHED"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {status === "PUBLISHED" ? "Published" : "Draft"}
    </span>
  );
}
