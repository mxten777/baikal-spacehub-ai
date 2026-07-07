-- ============================================================
-- 003_reservation.sql — Premium Reservation Experience
-- ============================================================

CREATE TABLE IF NOT EXISTS reservations (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  -- Step 1: 행사 유형
  event_type            TEXT NOT NULL
                        CHECK (event_type IN (
                          'exhibition','performance','workshop',
                          'brand_event','corporate','shoot',
                          'wedding','gathering','consultation'
                        )),

  -- Step 2: 행사 세부사항
  preferred_date        DATE,
  date_flexible         BOOLEAN DEFAULT FALSE,
  expected_attendees    INTEGER,
  event_purpose         TEXT,
  budget_range          TEXT,
  additional_details    JSONB DEFAULT '{}',

  -- Step 3: 추천/선택 공간
  recommended_space     TEXT,
  selected_space_id     UUID REFERENCES spaces(id) ON DELETE SET NULL,

  -- Step 4: 연락처
  name                  TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  email                 TEXT NOT NULL,
  company               TEXT,
  notes                 TEXT,

  -- CRM 상태 관리
  status                TEXT DEFAULT 'new'
                        CHECK (status IN (
                          'new','consulting','quote_sent',
                          'confirmed','completed','cancelled'
                        )),
  admin_notes           TEXT,
  assigned_to           TEXT
);

-- 업데이트 시각 자동 갱신
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reservations_updated_at ON reservations;
CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_reservations_updated_at();

-- RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 일반 사용자: INSERT만 허용
CREATE POLICY "anon_insert_reservations"
  ON reservations FOR INSERT TO anon
  WITH CHECK (true);

-- 관리자: 전체 권한
CREATE POLICY "admin_all_reservations"
  ON reservations FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- 인덱스
CREATE INDEX IF NOT EXISTS reservations_status_idx      ON reservations(status);
CREATE INDEX IF NOT EXISTS reservations_created_at_idx  ON reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_event_type_idx  ON reservations(event_type);
