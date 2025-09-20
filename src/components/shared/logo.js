// File: src/components/shared/logo.js
"use client";

import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple brand mark used throughout navigation components.
export default function Logo({ className, withText = true }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold", className)}>
      <PiggyBank className="h-6 w-6 text-primary" aria-hidden />
      {withText && <span className="text-lg">FinTrack</span>}
      <span className="sr-only">FinTrack home</span>
    </Link>
  );
}
