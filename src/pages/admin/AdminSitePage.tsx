import { useState } from "react";
import AdminHeroPage from "./AdminHeroPage";
import AdminAboutPage from "./AdminAboutPage";

type Tab = "hero" | "about";

export default function AdminSitePage() {
  const [activeTab, setActiveTab] = useState<Tab>("hero");

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-200 bg-white shrink-0 px-6 pt-4">
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-5 py-2.5 text-sm font-sans tracking-wide transition-colors border-b-2 -mb-px ${
            activeTab === "hero"
              ? "border-brand-black text-brand-black"
              : "border-transparent text-brand-muted hover:text-brand-black"
          }`}
        >
          Hero
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`px-5 py-2.5 text-sm font-sans tracking-wide transition-colors border-b-2 -mb-px ${
            activeTab === "about"
              ? "border-brand-black text-brand-black"
              : "border-transparent text-brand-muted hover:text-brand-black"
          }`}
        >
          About
        </button>
      </div>

      {/* Tab content — existing page components rendered as-is */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "hero" ? <AdminHeroPage /> : <AdminAboutPage />}
      </div>
    </div>
  );
}
