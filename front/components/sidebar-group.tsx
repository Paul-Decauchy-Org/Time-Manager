import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export type links = {
  name: string;
  links: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
};

export function SidebarLinks(item: links) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{item.name}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {item.links.map((link) => (
            <SidebarMenuItem key={link.title}>
              <SidebarMenuButton asChild>
                <Link href={link.url}>
                  <link.icon />
                  <span>{link.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
