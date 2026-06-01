import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { ComponentProps } from "react";

interface Props extends ComponentProps<typeof Avatar> {
  user: { name: string; imageUrl: string };
}

export function UserAvatar(props: Props) {
  const { user } = props;
  return (
    <Avatar {...props}>
      <AvatarImage src={user.imageUrl} alt={user.name} />
      <AvatarFallback className="uppercase">
        {user.name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
}
