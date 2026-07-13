/**
 * AdminOperatorSettingsPage.tsx
 * 운영 정보 — operator 이상 접근 가능
 *
 * 관리 항목: 연락처·주소·운영시간·SNS 링크·지도 URL
 * 시스템 설정(SEO·API·도메인)은 AdminSettingsPage에서 관리 (super_admin 전용)
 */

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { SiteSetting } from "../../types";
import { Check, Loader2, SlidersHorizontal } from "lucide-react";

// 운영자가 수정 가능한 항목 (연락처·주소·운영 시간·SNS)
const OPERATOR_KEYS = [
  {
    key: "contact_email",
    label: "대표 이메일",
    placeholder: "goworld33@naver.com",
    group: "연락처",
  },
  {
    key: "contact_phone",
    label: "대표 전화번호",
    placeholder: "1661-0288",
    group: "연락처",
  },
  {
    key: "address",
    label: "주소",
    placeholder: "경기도 하남시 미사동 468",
    group: "연락처",
  },
  {
    key: "business_hours",
    label: "운영 시간",
    placeholder: "화-일 11:00–21:00",
    group: "운영 정보",
  },
  {
    key: "holiday",
    label: "정기 휴무일",
    placeholder: "매주 월요일",
    group: "운영 정보",
  },
  {
    key: "instagram_url",
    label: "Instagram URL",
    placeholder: "https://instagram.com/thelit_official",
    group: "SNS",
  },
  {
    key: "youtube_url",
    label: "YouTube URL",
    placeholder: "https://youtube.com/@thelit",
    group: "SNS",
  },
  {
    key: "x_url",
    label: "X (Twitter) URL",
    placeholder: "https://x.com/thelit",
    group: "SNS",
  },
  {
    key: "kakao_map_url",
    label: "Kakao Map URL",
    placeholder: "https://map.kakao.com/...",
    group: "지도",
  },
  {
    key: "google_map_embed",
    label: "Google Maps Embed URL",
    placeholder: "https://maps.google.com/maps?q=...",
    group: "지도",
  },
];

const GROUPS = ["연락처", "운영 정보", "SNS", "지도"];

async function getSettings(): Promise<SiteSetting[]> {
  const { data } = await supabase.from("settings").select("*").order("key");
  return data ?? [];
}

async function upsertSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export default function AdminOperatorSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const getSettingValue = (key: string) =>
    settings.find((s) => s.key === key)?.value ?? "";

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    setErrorKey(null);
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
    } catch {
      setErrorKey(key);
      setTimeout(() => setErrorKey(null), 3000);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal size={16} className="text-brand-accent" />
          <h1 className="font-display text-2xl font-light text-brand-black">
            운영 정보
          </h1>
        </div>
        <p className="font-sans text-sm text-gray-500 mt-1">
          연락처·주소·운영 시간·SNS 링크 등 공개 운영 정보를 수정합니다.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-brand-muted" />
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map((group) => {
            const groupKeys = OPERATOR_KEYS.filter((k) => k.group === group);
            return (
              <div key={group}>
                <h2 className="font-sans text-xs tracking-wider uppercase text-gray-500 mb-3">
                  {group}
                </h2>
                <div className="bg-white border border-gray-200 divide-y divide-gray-100">
                  {groupKeys.map(({ key, label, placeholder }) => (
                    <SettingRow
                      key={key}
                      settingKey={key}
                      label={label}
                      placeholder={placeholder}
                      initialValue={getSettingValue(key)}
                      saving={savingKey === key}
                      saved={savedKey === key}
                      error={errorKey === key}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  error,
  onSave,
}: {
  settingKey: string;
  label: string;
  placeholder: string;
  initialValue: string;
  saving: boolean;
  saved: boolean;
  error: boolean;
  onSave: (key: string, value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className={`flex items-center gap-4 p-5 ${error ? "bg-red-50" : ""}`}>
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
            error
              ? "bg-red-600 text-white"
              : saved
              ? "bg-green-600 text-white"
              : "bg-brand-black text-white hover:bg-brand-muted"
          }`}
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          {error ? "저장 실패" : saved ? "저장됨" : "저장"}
        </button>
      </div>
    </div>
  );
}
