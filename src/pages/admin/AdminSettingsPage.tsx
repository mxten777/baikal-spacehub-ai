import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { SiteSetting } from "../../types";
import { Check, Loader2, Plus, Trash2, Shield } from "lucide-react";

// 시스템 설정 — super_admin 전용 (SEO·도메인·분석 도구 등)
const SYSTEM_KEYS = [
  { key: "site_name", label: "사이트명", placeholder: "The Lit" },
  {
    key: "site_description",
    label: "SEO 메타 설명",
    placeholder: "복합문화공간 플랫폼",
  },
  {
    key: "google_analytics_id",
    label: "Google Analytics ID",
    placeholder: "G-XXXXXXXXXX",
  },
  {
    key: "google_tag_manager_id",
    label: "Google Tag Manager ID",
    placeholder: "GTM-XXXXXXX",
  },
  {
    key: "naver_site_verification",
    label: "Naver 사이트 인증 코드",
    placeholder: "",
  },
  {
    key: "robots_txt_disallow",
    label: "robots.txt 추가 Disallow 경로",
    placeholder: "/internal/",
  },
];

// 운영 정보 키 목록 — 이 페이지에서는 표시하지 않음 (AdminOperatorSettingsPage에서 관리)
const OPERATOR_KEYS = [
  "contact_email",
  "contact_phone",
  "address",
  "instagram_url",
  "youtube_url",
  "x_url",
  "kakao_map_url",
  "google_map_embed",
  "business_hours",
  "holiday",
];

async function getSettings(): Promise<SiteSetting[]> {
  const { data } = await supabase.from("settings").select("*").order("key");
  return data ?? [];
}

async function upsertSetting(key: string, value: string): Promise<void> {
  await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
}

async function deleteSetting(id: string): Promise<void> {
  await supabase.from("settings").delete().eq("id", id);
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const getSettingValue = (key: string) =>
    settings.find((s) => s.key === key)?.value ?? "";

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      await upsertSetting(key, value);
      setSettings((prev) => {
        const existing = prev.find((s) => s.key === key);
        if (existing)
          return prev.map((s) => (s.key === key ? { ...s, value } : s));
        return [
          ...prev,
          {
            id: Date.now().toString(),
            key,
            value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } finally {
      setSavingKey(null);
    }
  };

  const handleDelete = async (setting: SiteSetting) => {
    if (!confirm(`"${setting.key}" 설정을 삭제하시겠습니까?`)) return;
    await deleteSetting(setting.id);
    setSettings((prev) => prev.filter((s) => s.id !== setting.id));
  };

  const handleAddCustom = async () => {
    if (!customKey.trim()) return;
    setAddingCustom(true);
    try {
      await upsertSetting(customKey.trim(), customValue);
      setSettings((prev) => {
        const existing = prev.find((s) => s.key === customKey.trim());
        if (existing)
          return prev.map((s) =>
            s.key === customKey.trim() ? { ...s, value: customValue } : s,
          );
        return [
          ...prev,
          {
            id: Date.now().toString(),
            key: customKey.trim(),
            value: customValue,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      });
      setCustomKey("");
      setCustomValue("");
    } finally {
      setAddingCustom(false);
    }
  };

  const customSettings = settings.filter(
    (s) =>
      !SYSTEM_KEYS.some((d) => d.key === s.key) &&
      !OPERATOR_KEYS.includes(s.key),
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-brand-accent" />
          <h1 className="font-display text-2xl font-light text-brand-black">
            시스템 설정
          </h1>
          {loading && (
            <Loader2 size={14} className="animate-spin text-gray-300" />
          )}
        </div>
        <p className="font-sans text-sm text-gray-500 mt-1">
          공급자 전용 — SEO·분석 도구·도메인 등 시스템 전역 설정을 관리합니다.
        </p>
        <p className="font-sans text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
          ⚠️ 연락처·SNS·운영 시간 변경은 <strong>운영 정보</strong> 메뉴에서
          하세요.
        </p>
      </div>

      <div className="space-y-8">
        {/* System settings */}
        <div className="bg-white border border-gray-200 divide-y divide-gray-100">
          {SYSTEM_KEYS.map(({ key, label, placeholder }) => {
            const currentValue = getSettingValue(key);
            return (
              <SettingRow
                key={key}
                settingKey={key}
                label={label}
                placeholder={placeholder}
                initialValue={currentValue}
                saving={savingKey === key}
                saved={savedKey === key}
                onSave={handleSave}
              />
            );
          })}
        </div>

        {/* Custom settings */}
        {customSettings.length > 0 && (
          <div>
            <h2 className="font-sans text-xs tracking-wider uppercase text-gray-500 mb-3">
              커스텀 설정
            </h2>
            <div className="bg-white border border-gray-200 divide-y divide-gray-100">
              {customSettings.map((setting) => (
                <SettingRow
                  key={setting.key}
                  settingKey={setting.key}
                  label={setting.key}
                  placeholder=""
                  initialValue={setting.value}
                  saving={savingKey === setting.key}
                  saved={savedKey === setting.key}
                  onSave={handleSave}
                  onDelete={() => handleDelete(setting)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add custom */}
        <div>
          <h2 className="font-sans text-xs tracking-wider uppercase text-gray-500 mb-3">
            커스텀 설정 추가
          </h2>
          <div className="bg-white border border-gray-200 p-5 flex flex-col sm:flex-row gap-3">
            <input
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="키 (예: footer_note)"
              className="flex-1 border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-black"
            />
            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="값"
              className="flex-[2] border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customKey.trim() || addingCustom}
              className="flex items-center gap-2 px-5 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors disabled:opacity-50"
            >
              {addingCustom ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  settingKey,
  label,
  placeholder,
  initialValue,
  saving,
  saved,
  onSave,
  onDelete,
}: {
  settingKey: string;
  label: string;
  placeholder: string;
  initialValue: string;
  saving: boolean;
  saved: boolean;
  onSave: (key: string, value: string) => void;
  onDelete?: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="flex items-center gap-4 p-5">
      <div className="w-48 flex-shrink-0">
        <p className="font-sans text-sm text-brand-black">{label}</p>
        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
          {settingKey}
        </p>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
      />
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onSave(settingKey, value)}
          disabled={saving || value === initialValue}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-sans tracking-wider uppercase transition-colors disabled:opacity-40 ${
            saved
              ? "bg-green-600 text-white"
              : "bg-brand-black text-white hover:bg-brand-muted"
          }`}
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          {saved ? "저장됨" : "저장"}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
