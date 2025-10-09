"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

type Props = {
  callbackUrl?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  children?: React.ReactNode;
};

export default function SignOutButton({
  callbackUrl = "/",
  className,
  variant = "secondary",
  size = "sm",
  children = "Выйти",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      // next-auth/react сам получит CSRF и корректно выполнит POST /api/auth/signout
      await signOut({ callbackUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
      aria-busy={loading}
    >
      {loading ? "Выходим..." : children}
    </Button>
  );
}
