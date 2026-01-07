"use client";

import { cn } from "@/lib/utils";
import { User } from "@/generated/graphql";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemberAvatarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  presence: "present" | "absent" | "working";
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function MemberAvatar({
  user,
  presence,
  size = "md",
  showTooltip = true,
}: MemberAvatarProps) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const dotSizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const presenceColor = {
    present: "bg-green-500",
    working: "bg-green-500",
    absent: "bg-orange-500",
  };

  const avatar = (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], "border-2 border-background")}>
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
          dotSizeClasses[size],
          presenceColor[presence],
          presence === "present" && "animate-pulse",
        )}
      />
    </div>
  );

  if (!showTooltip) {
    return avatar;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs">
              <span
                className={cn(
                  "inline-block w-2 h-2 rounded-full mr-1",
                  presenceColor[presence],
                )}
              />
              {presence === "present" ? "Présent" : "Absent"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
