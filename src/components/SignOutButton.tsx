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
  // делаем нейтральной по умолчанию
  variant = "outline",
  size = "sm",
  children = "Выйти",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
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
      // мягкий hover без смены брендовго цвета
      className={`transition-colors hover:bg-slate-100 ${className ?? ""}`}
      aria-busy={loading}
    >
      {loading ? "Выходим..." : children}
    </Button>
  );
}
