import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { SiteSetting } from '../../types'
import { Check, Loader2, Plus, Trash2 } from 'lucide-react'

const DEFAULT_KEYS = [
  { key: 'site_name', label: '사이트명', placeholder: 'The Lit' },
  { key: 'site_description', label: '사이트 설명', placeholder: '복합문화공간 플랫폼' },
  { key: 'contact_email', label: '연락처 이메일', placeholder: 'hello@thelit.kr' },
  { key: 'contact_phone', label: '연락처 전화번호', placeholder: '+82-XX-XXXX-XXXX' },
  { key: 'address', label: '주소', placeholder: '서울시 ...' },
  { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/@...' },
  { key: 'x_url', label: 'X (Twitter) URL', placeholder: 'https://x.com/...' },
  { key: 'kakao_map_url', label: 'Kakao Map URL', placeholder: 'https://map.kakao.com/...' },
  { key: 'google_map_embed', label: 'Google Maps Embed URL', placeholder: 'https://maps.google.com/maps?q=...' },
]

async function getSettings(): Promise<SiteSetting[]> {
  const { data } = await supabase.from('settings').select('*').order('key')
  return data ?? []
}

async function upsertSetting(key: string, value: string): Promise<void> {
  await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
}

async function deleteSetting(id: string): Promise<void> {
  await supabase.from('settings').delete().eq('id', id)
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [customKey, setCustomKey] = useState('')
  const [customValue, setCustomValue] = useState('')
  const [addingCustom, setAddingCustom] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings).finally(() => setLoading(false))
  }, [])

  const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value ?? ''

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key)
    try {
      await upsertSetting(key, value)
      setSettings(prev => {
        const existing = prev.find(s => s.key === key)
        if (existing) return prev.map(s => s.key === key ? { ...s, value } : s)
        return [...prev, { id: Date.now().toString(), key, value, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]
      })
      setSavedKey(key)
      setTimeout(() => setSavedKey(null), 2000)
    } finally {
      setSavingKey(null)
    }
  }

  const handleDelete = async (setting: SiteSetting) => {
    if (!confirm(`"${setting.key}" 설정을 삭제하시겠습니까?`)) return
    await deleteSetting(setting.id)
    setSettings(prev => prev.filter(s => s.id !== setting.id))
  }

  const handleAddCustom = async () => {
    if (!customKey.trim()) return
    setAddingCustom(true)
    try {
      await upsertSetting(customKey.trim(), customValue)
      setSettings(prev => {
        const existing = prev.find(s => s.key === customKey.trim())
        if (existing) return prev.map(s => s.key === customKey.trim() ? { ...s, value: customValue } : s)
        return [...prev, { id: Date.now().toString(), key: customKey.trim(), value: customValue, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]
      })
      setCustomKey('')
      setCustomValue('')
    } finally {
      setAddingCustom(false)
    }
  }

  const customSettings = settings.filter(s => !DEFAULT_KEYS.some(d => d.key === s.key))

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-light text-brand-black">Settings</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">사이트 설정 관리</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-brand-muted" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Standard settings */}
          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            {DEFAULT_KEYS.map(({ key, label, placeholder }) => {
              const currentValue = getSettingValue(key)
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
              )
            })}
          </div>

          {/* Custom settings */}
          {customSettings.length > 0 && (
            <div>
              <h2 className="font-sans text-xs tracking-wider uppercase text-gray-500 mb-3">커스텀 설정</h2>
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
            <h2 className="font-sans text-xs tracking-wider uppercase text-gray-500 mb-3">커스텀 설정 추가</h2>
            <div className="bg-white border border-gray-200 p-5 flex flex-col sm:flex-row gap-3">
              <input
                value={customKey}
                onChange={e => setCustomKey(e.target.value)}
                placeholder="키 (예: footer_note)"
                className="flex-1 border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-black"
              />
              <input
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                placeholder="값"
                className="flex-[2] border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customKey.trim() || addingCustom}
                className="flex items-center gap-2 px-5 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors disabled:opacity-50"
              >
                {addingCustom ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingRow({
  settingKey, label, placeholder, initialValue, saving, saved, onSave, onDelete,
}: {
  settingKey: string
  label: string
  placeholder: string
  initialValue: string
  saving: boolean
  saved: boolean
  onSave: (key: string, value: string) => void
  onDelete?: () => void
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <div className="flex items-center gap-4 p-5">
      <div className="w-48 flex-shrink-0">
        <p className="font-sans text-sm text-brand-black">{label}</p>
        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{settingKey}</p>
      </div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
      />
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onSave(settingKey, value)}
          disabled={saving || value === initialValue}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-sans tracking-wider uppercase transition-colors disabled:opacity-40 ${
            saved ? 'bg-green-600 text-white' : 'bg-brand-black text-white hover:bg-brand-muted'
          }`}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          {saved ? '저장됨' : '저장'}
        </button>
        {onDelete && (
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
