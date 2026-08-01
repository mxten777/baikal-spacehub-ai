import { useState } from "react";
import AdminContentSourcesPage from "./AdminContentSourcesPage";
import AdminExternalContentPage from "./AdminExternalContentPage";

type Tab = "sources" | "external";

export default function AdminExternalPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sources");

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-200 bg-white shrink-0 px-6 pt-4">
        <button
          onClick={() => setActiveTab("sources")}
          className={`px-5 py-2.5 text-sm font-sans tracking-wide transition-colors border-b-2 -mb-px ${
            activeTab === "sources"
              ? "border-brand-black text-brand-black"
              : "border-transparent text-brand-muted hover:text-brand-black"
          }`}
        >
          콘텐츠 소스
        </button>
        <button
          onClick={() => setActiveTab("external")}
          className={`px-5 py-2.5 text-sm font-sans tracking-wide transition-colors border-b-2 -mb-px ${
            activeTab === "external"
              ? "border-brand-black text-brand-black"
              : "border-transparent text-brand-muted hover:text-brand-black"
          }`}
        >
          외부 콘텐츠
        </button>
      </div>

      {/* Tab content — existing page components rendered as-is */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "sources" ? (
          <AdminContentSourcesPage />
        ) : (
          <AdminExternalContentPage />
        )}
      </div>
    </div>
  );
}
