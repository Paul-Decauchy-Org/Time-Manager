"use client";
import { Calendar, Home, Settings, Search, CircleUserRoundIcon, UsersRound } from "lucide-react"

import {
    Sidebar,
    SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import {useAuth} from "@/contexts/AuthContext";
import {links, SidebarLinks} from "@/components/sidebar-group";
import Link from "next/link";
import {IconLogout} from "@tabler/icons-react";
import {useLogout} from "@/hooks/logout";
import {useRouter} from "next/navigation";

// Menu items.
const items: links = {
    name: "Application",
    links: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
        },
        {
            title: "Leaves",
            url: "/dashboard/leaves",
            icon: Calendar
        },
    ]
}

const managerItems: links = {
    name: "Manager",
    links: [
        {
            title: "Teams",
            url: "/dashboard/teams",
            icon: UsersRound,
        },
        {
            title: "KPIs",
            url: "/dashboard/kpi",
            icon: Search,
        },
    ]
}

const adminItems: links = {
    name: "Admin",
    links: [
        {
            title: "Admin",
            url: "/dashboard/admin",
            icon: CircleUserRoundIcon
        }
    ]
}

export function AppSidebar() {
    const {user, isManager, isAdmin, loading} = useAuth()
    const {logout} = useLogout()
    const router = useRouter()
    async function handleLogout() {
        await logout()
        router.push("/login")
    }
    if (loading) {
        return (
            <Sidebar>
                <SidebarContent>
                    {/* Loader ou rien pendant le chargement */}
                </SidebarContent>
            </Sidebar>
        )
    }
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarLinks name={items.name} links={items.links}/>
                {isManager && (
                    <SidebarLinks name={managerItems.name} links={managerItems.links}/>
                )}
                {isAdmin && (
                    <SidebarLinks name={adminItems.name} links={adminItems.links}/>
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <span>Profile</span>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                                <SidebarMenuItem key={"Profile"}>
                                    <SidebarMenuButton asChild>
                                        <Link href="/dashboard/me">
                                            <Settings/>
                                            <span>Settings</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            <SidebarMenuItem key={"Logout"}>
                                <SidebarMenuButton asChild onClick={handleLogout}>
                                    <div>
                                        <IconLogout/>
                                        <span>{"Logout"}</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    )
}