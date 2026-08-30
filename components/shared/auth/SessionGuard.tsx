"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { getUserById } from "@/lib/database/actions/user.actions";
import { useEffect } from "react";

export default function SessionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoaded } = useAuth();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    let isCancelled = false;

    const validateSession = async () => {
      try {
        const response = await getUserById(userId);

        if (isCancelled) return;

        if (!response?.success || !response.user) {
          await signOut({ redirectUrl: "/sign-in" });
          return;
        }
      } catch (error) {
        if (isCancelled) return;
        await signOut({ redirectUrl: "/sign-in" });
      }
    };

    validateSession();
    const interval = setInterval(validateSession, 15000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isLoaded, userId, signOut]);

  return <>{children}</>;
}
