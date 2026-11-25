import React from "react";
import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07080C] px-6 text-center text-[#F8FAFC]">
      <div className="max-w-md space-y-6 rounded-3xl border border-white/10 bg-[#0D101B] p-8 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
          <Terminal className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <div className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
            ERROR 404 // SIGNAL LOST
          </div>
          <h1 className="text-2xl font-bold">Coordinates Not Found</h1>
          <p className="text-sm text-slate-400">
            The requested portfolio route does not exist in this digital signature architecture.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Digital Identity
        </Link>
      </div>
    </div>
  );
}
