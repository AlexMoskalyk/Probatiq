"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/src/lib/utils";

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root>;

function Avatar(props: AvatarProps) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...rest}
    />
  );
}

type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;

function AvatarImage(props: AvatarImageProps) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...rest}
    />
  );
}

type AvatarFallbackProps = React.ComponentProps<
  typeof AvatarPrimitive.Fallback
>;

function AvatarFallback(props: AvatarFallbackProps) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-primary/10 text-primary flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...rest}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
