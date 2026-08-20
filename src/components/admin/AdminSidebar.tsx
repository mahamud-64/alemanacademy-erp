import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { adminNav } from "@/lib/admin/nav";
import { useLang } from "@/lib/i18n";
import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const { tb, t } = useLang();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeModule = pathname.replace(/^\/admin\/?/, "");

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <img src={logo} alt="" className="size-8 shrink-0 rounded-full" />
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{t("Admin ERP", "এডমিন ইআরপি")}</p>
              <p className="truncate text-xs text-white/80">Al Eman Islamic Academy</p>
            </div>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
            {adminNav.map((group) => {
              const groupActive = group.items.some(
                (item) => item.module === activeModule,
              );

              /*
              * ==========================================================
              * DIRECT NAVIGATION ITEM
              *
              * Used for items such as:
              * Teacher Login Access
              *
              * No dropdown.
              * No ChevronDown.
              * Clicking the button directly opens the route.
              * ==========================================================
              */

              if (group.direct) {
                const item = group.items[0];

                if (!item) {
                  return null;
                }

                return (
                  <SidebarMenuItem
                    key={group.label.en}
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={tb(group.label)}
                      isActive={groupActive}
                    >
                      <Link
                        to="/admin/$module"
                        params={{
                          module: item.module,
                        }}
                        search={
                          item.action
                            ? {
                                action:
                                  item.action,
                              }
                            : {}
                        }
                      >
                        <group.icon
                          className="size-4"
                          aria-hidden
                        />

                        <span className="truncate">
                          {tb(group.label)}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              /*
              * ==========================================================
              * NORMAL COLLAPSIBLE ADMIN GROUP
              *
              * Existing behavior remains unchanged.
              * ==========================================================
              */

              return (
                <Collapsible
                  key={group.label.en}
                  defaultOpen={groupActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={tb(group.label)}
                        isActive={groupActive}
                      >
                        <group.icon
                          className="size-4"
                          aria-hidden
                        />

                        <span className="truncate">
                          {tb(group.label)}
                        </span>

                        <ChevronDown
                          className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180"
                          aria-hidden
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map(
                          (item) => (
                            <SidebarMenuSubItem
                              key={`${item.module}-${item.label.en}`}
                            >
                              <SidebarMenuSubButton
                                asChild
                              >
                                {item.module ===
                                "" ? (
                                  <Link to="/admin">
                                    {tb(
                                      item.label,
                                    )}
                                  </Link>
                                ) : (
                                  <Link
                                    to="/admin/$module"
                                    params={{
                                      module:
                                        item.module,
                                    }}
                                    search={
                                      item.action
                                        ? {
                                            action:
                                              item.action,
                                          }
                                        : {}
                                    }
                                  >
                                    {tb(
                                      item.label,
                                    )}
                                  </Link>
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ),
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip={t("Sign out", "সাইন আউট")} className="text-destructive">
              <LogOut className="size-4" aria-hidden />
              <span>{t("Sign out", "সাইন আউট")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
