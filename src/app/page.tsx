"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to assistant page on load
    router.replace("/assistant");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4">
          <img src="/harvey-avatar.svg" alt="Harvey" className="w-8 h-8" />
        </div>
        <p className="text-neutral-500 text-sm">Redirecting to Harvey Assistant...</p>
      </div>
    </div>
  );
}
