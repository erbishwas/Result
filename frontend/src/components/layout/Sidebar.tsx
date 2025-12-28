import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { sidebarMenu } from "./sidebarMenu";
import { useAuth } from "../auth/AuthContext";
import getIcon from "./icon";
import { useChange } from "../auth/ChangeContext";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { user, adminGradeSelection } = useAuth();
  const { version } = useChange();

  const toggleGroup = (key: string) => {
    if (isCollapsed) return;
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // 🔁 Refresh sidebar intelligently
  const refreshSidebar = () => {
    const path = location.pathname;
    const newOpen = new Set<string>();

    sidebarMenu.forEach((section) => {
      section.groups.forEach((group) => {
        const key = `${section.label}-${group.title}`;
        const hasActiveItem = group.items.some(
          (item) => path === item.href || path.startsWith(item.href + "/")
        );

        if (hasActiveItem) newOpen.add(key);
      });
    });

    setOpenGroups(newOpen);
  };

  useEffect(() => {
    refreshSidebar();
  }, [version, location.pathname]);

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 
        bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700 
        shadow-lg
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
        ${sidebarWidth} flex flex-col
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h2
          className={`
            font-bold text-xl text-gray-900 dark:text-gray-100 
            transition-all duration-300
            ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "w-auto"}
          `}
        >
          Control Panel
        </h2>

        <button
          onClick={onToggleCollapse}
          className="
            hidden lg:flex p-2 rounded-lg 
            text-gray-600 dark:text-gray-400 
            hover:bg-gray-200 dark:hover:bg-gray-700 
            hover:text-gray-900 dark:hover:text-gray-100
            transition-colors
          "
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        {sidebarMenu.map((section) => {
          if (section.section === "admin" && !user?.is_admin) return null;
          if (section.section === "user" && user?.is_admin && adminGradeSelection === null) return null;

          return (
            <div key={section.label} className="mb-8">
              {!isCollapsed && (
                <div className="px-3 mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                  {section.label}
                </div>
              )}

              {section.groups.map((group) => {
                const key = `${section.label}-${group.title}`;
                const isOpenGroup = openGroups.has(key);

                return (
                  <div key={group.title} className="mb-2">
                    <button
                      onClick={() => toggleGroup(key)}
                      className={`
                        w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isCollapsed ? "justify-center" : "justify-between"}
                        text-gray-700 dark:text-gray-300
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        hover:text-gray-900 dark:hover:text-gray-100
                      `}
                    >
                      <span className={isCollapsed ? "sr-only" : ""}>{group.title}</span>
                      {!isCollapsed && (
                        <span>
                          {isOpenGroup ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      )}
                    </button>

                    {(isOpenGroup || isCollapsed) && (
                      <ul className={`mt-2 space-y-1 ${isCollapsed ? "" : "pl-2"}`}>
                        {group.items.map((item) => {
                          const active = isActive(item.href);

                          return (
                            <li key={item.name}>
                              {isCollapsed ? (
                                <Link
                                  to={item.href}
                                  title={item.name}
                                  className={`
                                    flex justify-center items-center p-3 mx-2 rounded-lg
                                    transition-all duration-200
                                    ${active
                                      ? "bg-[#417690] text-white shadow-md"
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"}
                                  `}
                                >
                                  {getIcon(item.name)}
                                </Link>
                              ) : (
                                <NavLink
                                  to={item.href}
                                  className={`
                                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                                    transition-all duration-200
                                    ${active
                                      ? "bg-[#417690] text-white shadow-md"
                                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"}
                                  `}
                                >
                                  {getIcon(item.name)}
                                  <span>{item.name}</span>
                                </NavLink>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
