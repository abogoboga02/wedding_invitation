type DashboardNavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
};

type DashboardNavigationGroup = {
  title: string;
  items: DashboardNavigationItem[];
};

export const dashboardNavigation: DashboardNavigationGroup[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", shortLabel: "Home" },
      { href: "/dashboard/templates", label: "Pilih Template", shortLabel: "Template" },
      { href: "/dashboard/setup", label: "Setup Undangan", shortLabel: "Setup" },
      { href: "/dashboard/media", label: "Media", shortLabel: "Media" },
    ],
  },
  {
    title: "Distribusi",
    items: [
      { href: "/dashboard/guests", label: "Daftar Tamu", shortLabel: "Tamu" },
      { href: "/dashboard/send", label: "Kirim Undangan", shortLabel: "Kirim" },
      { href: "/dashboard/preview", label: "Preview", shortLabel: "Preview" },
    ],
  },
  {
    title: "Insight",
    items: [
      { href: "/dashboard/rsvp", label: "RSVP", shortLabel: "RSVP" },
      { href: "/dashboard/analytics", label: "Analytics", shortLabel: "Analytics" },
      { href: "/dashboard/settings", label: "Settings", shortLabel: "Settings" },
    ],
  },
];
