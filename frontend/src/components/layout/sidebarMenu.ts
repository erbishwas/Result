export type MenuItem = {
  name: string;
  href: string;
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export type MenuSection = {
  section: "admin" | "user";
  label: string;
  groups: MenuGroup[];
};

export const sidebarMenu: MenuSection[] = [
  {
    section: "admin",
    label: "Admin Control",
    groups: [
      {
        title: "Setup",
        items: [
          { name: "Users", href: "/users" },
          { name: "Year", href: "/years" },
          { name: "Grade", href: "/grades" },
          {name: "User Roles", href: "/user-roles" },
        ],
      },
      {
        title: "Configuration",
        items: [
          { name: "Settings", href: "/admin/settings" },
          { name: "Email Log", href: "/admin/email-log" },
        ],
      },
    ],
  },

  {
    section: "user",
    label: "User Workspace",
    groups: [
      {
        title: "Setup",
        items: [
          { name: "Subjects Management", href: "/subjects" },
          { name: "Posts", href: "/posts" },
          { name: "Media", href: "/media" },
        ],
      },
      {
        title: "Account",
        items: [
          { name: "Profile", href: "/profile" },
          { name: "Settings", href: "/settings" },
        ],
      },
    ],
  },
];

