# BAIKAL Admin Framework v2.0 Standard

**Based on THE LIT — Verified in Production**
_Enterprise Admin Architecture for All BAIKAL Projects_

---

## 1. Framework 철학

### 핵심 명제

> "운영자가 코드를 열지 않고 홈페이지를 운영할 수 있어야 한다."

THE LIT에서 검증된 이 원칙이 모든 BAIKAL 프로젝트의 관리자 시스템 설계 기준이다.

### 5가지 설계 원칙

**1. 업무 중심 설계**
운영자의 실제 일과(문의 확인 → 콘텐츠 수정 → 사진 업로드 → 예약 처리)를 기준으로 메뉴와 동선을 설계한다. 기능 목록이 아닌 업무 흐름이 IA를 결정한다.

**2. 10분 온보딩**
새 운영자가 처음 로그인했을 때 대시보드만 보고 오늘 해야 할 일을 파악할 수 있어야 한다. 설명 없이 사용 가능한 UI가 목표다.

**3. 역할 분리**
콘텐츠 운영(Operator)과 시스템 관리(Super Admin)는 완전히 분리된다. 운영자는 구조를 볼 수 없고, 관리자는 콘텐츠 운영에 개입하지 않는다.

**4. AI-Ready 구조**
현재 AI 기능을 구현하지 않더라도, 모든 콘텐츠 필드는 향후 AI가 카피 생성·SEO 생성·이미지 추천을 추가할 수 있도록 구조화된 JSONB/TEXT 형태로 저장한다.

**5. 프로젝트 독립성**
Brand, Content, Media, Customer 각 영역은 독립적으로 존재한다. 새 프로젝트에 적용할 때 필요한 영역만 활성화하고 나머지는 비활성화한다.

---

## 2. 전체 IA

```
BAIKAL Admin Framework v2.0
│
├── Dashboard
│   ├── Today (긴급 작업)
│   ├── Brand Status
│   ├── Content Status
│   └── Quick Actions
│
├── Brand CMS
│   ├── Brand Story
│   ├── Experience / Journey
│   ├── Philosophy / Values
│   ├── History
│   └── SEO  ← Super Admin only
│
├── Content CMS
│   ├── Pages (단일 페이지 콘텐츠)
│   ├── Stories (Blog)
│   ├── Archive
│   ├── Programs
│   ├── Spaces
│   └── Wedding (도메인 특화)
│
├── Media CMS
│   ├── Photo Projects
│   ├── Photo Curator
│   ├── Videos / SNS
│   └── Asset Explorer
│
├── Customer
│   ├── Inquiries
│   ├── Reservations
│   └── CRM  ← v3.0 예정
│
├── AI Studio  ← v3.0 예정
│   ├── SEO Assistant
│   ├── Copy Assistant
│   ├── Image Assistant
│   └── SNS Assistant
│
└── System  ← Super Admin only
    ├── Site Configuration (Hero, About)
    ├── Users & Roles
    ├── Settings
    ├── External Content
    └── Logs
```

---

## 3. 관리자 메뉴 표준

### 메뉴 구성 규칙

**Operator 메뉴** (운영자가 매일 사용)

| 섹션        | 메뉴 항목   | 경로                       | 권한              |
| ----------- | ----------- | -------------------------- | ----------------- |
| —           | 대시보드    | `/admin`                   | dashboard         |
| 콘텐츠      | 공간        | `/admin/spaces`            | spaces            |
| 콘텐츠      | 프로그램    | `/admin/programs`          | programs          |
| 콘텐츠      | 아카이브    | `/admin/archive`           | archive           |
| 콘텐츠      | 블로그      | `/admin/blog`              | blog              |
| 브랜드      | Brand CMS   | `/admin/brand`             | brand             |
| 웨딩        | 웨딩        | `/admin/wedding`           | wedding_photos    |
| 소셜 미디어 | 소셜 미디어 | `/admin/media`             | media             |
| 고객 관리   | 문의 관리   | `/admin/inquiries`         | inquiries         |
| 고객 관리   | 예약 관리   | `/admin/reservations`      | reservations      |
| 운영        | 운영 정보   | `/admin/operator-settings` | operator_settings |

**Super Admin 추가 메뉴** (구조 관리, 비정기적 사용)

| 섹션           | 메뉴 항목        | 경로                    | 권한            |
| -------------- | ---------------- | ----------------------- | --------------- |
| 사이트 구성    | 사이트 구성      | `/admin/site`           | hero            |
| 사용자 및 권한 | 사용자 관리      | `/admin/users`          | users           |
| 시스템         | 시스템 설정      | `/admin/settings`       | system_settings |
| 외부 콘텐츠    | 외부 콘텐츠 관리 | `/admin/external`       | content_sources |
| 데이터 및 자산 | 촬영 프로젝트    | `/admin/photo-projects` | photo_projects  |
| 데이터 및 자산 | 사진 큐레이터    | `/admin/photo-curator`  | photo_curator   |

### 메뉴 설계 규칙

- **섹션 헤더**는 관련 메뉴를 논리적으로 묶는다. 섹션 헤더 다음에 아이템이 없으면 헤더를 숨긴다.
- **빈 섹션 처리**: `filterNavEntries()` 유틸리티로 권한 없는 항목을 제거한 후, 홀로 남은 섹션 헤더도 자동 제거한다.
- **정확한 경로 매칭**: 대시보드는 `exact: true`, 나머지는 prefix 매칭.
- **아이콘**: 각 항목에 Lucide 아이콘 1개를 사용한다. 텍스트만으로 구분이 어려운 항목은 색상 차이를 추가하지 않는다.

---

## 4. 권한 표준

### 3계층 역할 모델

```
Super Admin  ←  바이칼시스템즈 전용
    │
Operator     ←  프로젝트 운영자
    │
Viewer       ←  읽기 전용 (확장 예정)
```

### 권한 매트릭스

| 권한 키             | Viewer | Operator | Super Admin | 설명                  |
| ------------------- | ------ | -------- | ----------- | --------------------- |
| `dashboard`         | ✅     | ✅       | ✅          | 대시보드 조회         |
| `spaces`            | —      | ✅       | ✅          | 공간 관리             |
| `programs`          | —      | ✅       | ✅          | 프로그램 관리         |
| `archive`           | —      | ✅       | ✅          | 아카이브 관리         |
| `blog`              | —      | ✅       | ✅          | 블로그 관리           |
| `brand`             | —      | ✅       | ✅          | Brand CMS (콘텐츠 탭) |
| `media`             | —      | ✅       | ✅          | 소셜 미디어           |
| `inquiries`         | —      | ✅       | ✅          | 문의 관리             |
| `reservations`      | —      | ✅       | ✅          | 예약 관리             |
| `wedding_photos`    | —      | ✅       | ✅          | 웨딩 사진/문의        |
| `photo_curator`     | —      | ✅       | ✅          | 사진 큐레이션         |
| `operator_settings` | —      | ✅       | ✅          | 운영 정보             |
| `hero`              | —      | —        | ✅          | Hero 슬라이드         |
| `about`             | —      | —        | ✅          | About 구조 편집       |
| `system_settings`   | —      | —        | ✅          | SEO·API·도메인        |
| `users`             | —      | —        | ✅          | 사용자·계정           |
| `security`          | —      | —        | ✅          | 보안·키               |
| `content_sources`   | —      | —        | ✅          | 외부 콘텐츠 소스      |
| `photo_projects`    | —      | —        | ✅          | 촬영 프로젝트         |

### Brand CMS 탭별 권한

| 탭                   | Operator | Super Admin |
| -------------------- | -------- | ----------- |
| Brand Story          | ✅ 수정  | ✅ 수정     |
| Experience / Journey | ✅ 수정  | ✅ 수정     |
| Philosophy / Values  | ✅ 수정  | ✅ 수정     |
| History              | ✅ 수정  | ✅ 수정     |
| **SEO**              | ❌ 숨김  | ✅ 수정     |

### 권한 구현 패턴

```typescript
// Route 레벨
<RoleGuard permission="brand">
  <AdminBrandPage />
</RoleGuard>

// 컴포넌트 레벨 (SEO 탭 등)
const { isSuperAdmin } = useAuth();
const visibleTabs = TABS.filter(t => !t.superAdminOnly || isSuperAdmin);

// 권한 없으면 /admin 리다이렉트 (로그인 상태 유지)
```

---

## 5. Dashboard 표준

### 3-Zone 레이아웃

```
┌─────────────────────────────────────────┐
│  Zone 1: Today (오늘 할 일)               │
│  신규 문의 N  |  신규 예약 N  |  승인 대기 N │
│  → 긴급 처리 필요 항목만 표시              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Zone 2: Brand Status                    │
│  Experience Journey N단계 | Wedding N트랙  │
│  History N항목 | Philosophy N항목 | SEO ✓ │
│  마지막 수정: 2026-08-03 14:23           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Zone 3: Content Status + Quick Actions  │
│  공간 N  |  프로그램 N  |  아카이브 N      │
│  블로그 N  |  Hero N  (super_admin only)  │
└─────────────────────────────────────────┘
```

### StatCard 표준

```typescript
interface StatCard {
  icon: LucideIcon;
  label: string; // 영문 UPPERCASE 표시
  value: number | string;
  href: string; // 클릭 시 해당 관리 페이지로
  color: string; // bg-{color}-600
}
// value === 0 → bg-gray-300 (아이콘 비활성)
// value > 0  → color 적용
```

### Brand Status Card 표준

```typescript
interface BrandStatusItem {
  label: string; // 항목명
  ok: boolean; // true = 정상, false = 주의 필요
  count?: number; // 항목 수 (있을 때만)
  unit?: string; // 단위 ("단계", "트랙", "항목")
  href: string; // 클릭 시 이동 경로
  superAdminOnly?: boolean;
}
```

- `ok = true` → `CheckCircle` 녹색
- `ok = false` → `AlertCircle` 황색 (미작성 콘텐츠 경고)
- 마지막 수정일 표시 (`about_content.updated_at`)

### Quick Actions 표준

운영자에게 가장 빈번한 작업 5개를 고정 배치한다.
링크 아이템만 사용하고, 모달/폼은 Quick Actions에 포함하지 않는다.

---

## 6. Brand CMS 표준

### 모든 프로젝트의 Brand 5구조

```
Brand CMS
├── Brand Story   → "우리는 왜 이것을 만들었나"
├── Experience    → "고객이 경험하는 감정 흐름"
├── Philosophy    → "우리가 믿는 것들 (Values)"
├── History       → "타임라인 (연도별 이정표)"
└── SEO           → "검색엔진 메타데이터" (Super Admin)
```

### DB 설계 원칙

모든 Brand 콘텐츠는 **단일 테이블 단일 행** 방식을 사용한다.

```sql
-- 공통 패턴: about_content 테이블 (1행)
CREATE TABLE about_content (
  id                UUID PRIMARY KEY,
  -- Brand Story
  story_eyebrow     TEXT,
  story_title_line1 TEXT,
  story_title_line2 TEXT,
  story_paragraph_1 TEXT,
  story_paragraph_2 TEXT,
  story_paragraph_3 TEXT,
  -- Experience / Journey (JSONB array)
  journey_steps     JSONB,   -- [{number, emotion, desc, is_visible}]
  -- Philosophy / Values (JSONB array)
  brand_values      JSONB,   -- [{icon, title, desc}]
  values_eyebrow    TEXT,
  values_title      TEXT,
  -- History / Timeline (JSONB array)
  timeline          JSONB,   -- [{year, title, desc}]
  -- CTA
  cta_title         TEXT,
  cta_description   TEXT,
  -- SEO (Super Admin)
  seo_title         TEXT,
  seo_description   TEXT,
  seo_og_image      TEXT,
  seo_keywords      TEXT,
  updated_at        TIMESTAMPTZ
);
```

### Journey Step 표준 스키마

```typescript
interface JourneyStep {
  number: string; // "01" ~ "07"
  emotion: string; // 단계명 (영문 권장)
  desc: string; // 한국어 설명
  is_visible: boolean; // 홈페이지 노출 여부
  icon?: string; // 선택적 아이콘 (이모지/기호)
  cta_text?: string; // 선택적 CTA 텍스트
  cta_href?: string; // 선택적 CTA 링크
}
```

### Domain Experience 표준 스키마 (Wedding/Product/Service)

```typescript
interface DomainExperience {
  number: string; // "01", "02", "03"
  track: string; // 트랙명 (예: "House Wedding")
  keywords: string[]; // 키워드 배지
  title: string; // 한국어 타이틀
  desc: string; // 설명
  recommended: string[]; // 추천 대상
  venue: string; // 장소/카테고리명
  cta_text?: string;
  cta_href?: string;
  is_visible: boolean;
  sort_order: number;
}
```

### Fallback 표준 (핵심)

```
DB 미로딩 (undefined)              → HARDCODED_FALLBACK 표시
DB 오류 (service catches)          → DEFAULT 데이터 표시 (동일 콘텐츠)
DB 컬럼 없음 (마이그레이션 미적용)   → HARDCODED_FALLBACK 표시
DB 정상, 전체 is_visible=false     → 0개 표시 (섹션 숨김)
DB 정상, 일부 visible              → 해당 항목만 표시
```

**절대 원칙**: 운영자가 의도적으로 숨긴 항목은 Fallback으로 복구하지 않는다.

```typescript
// 올바른 Fallback 판단 패턴
const displayItems = useMemo(() => {
  if (!dbData) return FALLBACK; // 미로딩
  const configured = dbData.items ?? [];
  if (configured.length === 0) return FALLBACK; // 미설정
  return configured.filter((i) => i.is_visible); // 운영자 의도 존중
}, [dbData]);

// 섹션 숨김 guard
if (dbData && dbData.items?.length > 0 && displayItems.length === 0)
  return null;
```

---

## 7. Content CMS 표준

### 콘텐츠 유형별 표준 필드

**공통 필드 (모든 콘텐츠)**

```typescript
interface ContentBase {
  id: UUID;
  slug: string; // URL-safe identifier
  title: string;
  is_published: boolean;
  publish_status: "draft" | "published" | "archived";
  is_featured: boolean; // 홈페이지 노출
  sort_order: number; // 표시 순서
  created_at: ISODateString;
  updated_at: ISODateString;
}
```

**Publish Status 3단계**

| 상태        | 설명    | 홈페이지 표시 |
| ----------- | ------- | ------------- |
| `draft`     | 작성 중 | ❌            |
| `published` | 공개    | ✅            |
| `archived`  | 보관    | ❌            |

**Stories (Blog) 특화**

```typescript
{
  is_featured:       boolean;  // true → 홈페이지 Featured Stories 섹션
  meta_title?:       string;
  meta_description?: string;
  og_image?:         string;
  view_count:        number;
}
```

### CMS 페이지 표준 UX 패턴

```
┌──────────────────────────────────┐
│ 목록 (Table/Grid)                 │
│ - 검색 + 필터 (status, category)  │
│ - 항목 클릭 → 편집 패널 열림       │
│ - 상태 배지 (draft/published)      │
│ - 빠른 토글 (is_published)         │
└──────────────────────────────────┘
        ↓ 항목 클릭
┌──────────────────────────────────┐
│ 편집 패널 (Side Panel 또는 Modal) │
│ - 섹션별 저장 (전체 저장 X)        │
│ - 저장 성공: "저장됨" 2초 표시     │
│ - 저장 실패: 에러 메시지 인라인    │
│ - 이미지: ImageUploadField 컴포넌트 │
└──────────────────────────────────┘
```

### Brand CMS 저장 패턴 (섹션별 저장)

```typescript
// 전체 저장이 아닌 섹션별 독립 저장
type SectionKey =
  | "story"
  | "journey"
  | "wedding"
  | "philosophy"
  | "history"
  | "seo";

const handleSave = async (
  section: SectionKey,
  updates: Partial<AboutContent>,
) => {
  setSavingSection(section);
  const updated = await aboutService.update(content.id, updates);
  setContent(updated);
  setSavedSection(section);
  setTimeout(() => setSavedSection(null), 2000);
};
```

---

## 8. Media CMS 표준

### 3계층 미디어 구조

```
Photo Project (최상위 — 촬영 목적 단위)
    │
    ├── Stage (작업 단계)
    │   source → selected → edited → web → pdf
    │
    └── Photo Record (개별 파일)
        ├── space_category (공간/도메인 분류)
        ├── photo_type (hero/interior/people/event...)
        ├── tags[] (검색·자동 연결용)
        ├── is_featured (대표 이미지 여부)
        ├── project_category (main/wedding/about/brand/...)
        └── AI analysis fields (optional)
```

### Project Category 표준

```typescript
type ProjectCategory =
  | "main" // 메인 홈페이지용
  | "wedding" // 웨딩 갤러리
  | "space" // 공간 소개
  | "about" // About 히어로
  | "brand" // 브랜드 이미지
  | "archive" // 아카이브 커버
  | "food_beverage" // F&B
  | "online_wedding" // 온라인 웨딩
  | "contact"; // 문의 페이지
```

### 자동 대표 이미지 연결 원칙

운영자가 사진 업로드 시 `project_category`만 지정하면, 프런트엔드에서 해당 카테고리의 `stage='web'` + `is_featured=true` 사진을 자동으로 해당 섹션에 표시한다.

```typescript
// 프런트엔드 패턴
const { data: heroPhotos } = usePublicPhotos("about"); // About 히어로
const { data: weddingPhotos } = usePublicPhotos("wedding"); // Wedding 갤러리
const { data: brandPhotos } = usePublicPhotos("brand"); // Brand 섹션
```

### 미디어 파이프라인 (Stage Flow)

```
source (원본 업로드)
    ↓
selected (편집 대상 선정)
    ↓
edited (보정 완료)
    ↓
web (웹 게시 — 공개)    ← 이 단계부터 프런트엔드에 노출
    ↓
pdf (인쇄물용)          ← 별도 관리
```

### Photo Stage 권한

| 액션               | Operator | Super Admin |
| ------------------ | -------- | ----------- |
| web 단계 사진 조회 | ✅       | ✅          |
| featured 설정      | ✅       | ✅          |
| 태그 수정          | ✅       | ✅          |
| project 생성       | —        | ✅          |
| stage 변경         | —        | ✅          |
| 삭제               | —        | ✅          |

---

## 9. Customer CMS 표준

### 문의 (Inquiry)

```typescript
type InquiryStatus = "pending" | "reviewing" | "replied" | "closed";

type InquiryType =
  | "rental" // 공간 대관
  | "collaboration" // 협업
  | "general" // 일반 문의
  | "media" // 미디어/촬영
  | "wedding"; // 웨딩 문의
```

**문의 처리 흐름**

```
pending → reviewing → replied → closed
  ↑
대시보드 Today 섹션에 pending 건수 표시
```

### 예약 (Reservation)

```typescript
type ReservationStatus =
  | "new" // 신규 — 대시보드 Today에 표시
  | "consulting" // 상담 중
  | "quote_sent" // 견적 발송
  | "confirmed" // 확정
  | "completed" // 완료
  | "cancelled"; // 취소
```

**예약 단계별 어드민 액션**

| 상태       | 어드민 할 일                         |
| ---------- | ------------------------------------ |
| new        | 상담 일정 잡기 → consulting으로 변경 |
| consulting | 견적 작성 → quote_sent               |
| quote_sent | 고객 확인 대기 → confirmed           |
| confirmed  | 행사 진행 → completed                |

### CRM (v3.0 예정)

현재 DB에 `admin_notes` 필드로 고객별 메모를 저장하는 방식으로 준비됨.
정식 CRM은 v3.0에서 별도 테이블로 확장.

---

## 10. AI CMS 표준

### 현재 데이터 구조 (AI-Ready)

THE LIT에서 구현된 모든 콘텐츠 필드는 AI 확장을 위해 다음 조건을 충족한다.

| 조건                                                                   | 구현 |
| ---------------------------------------------------------------------- | ---- |
| 구조화된 JSONB (journey_steps, brand_values)                           | ✅   |
| 분리된 텍스트 필드 (title, description, keywords)                      | ✅   |
| SEO 전용 필드 (seo_title, seo_description, seo_og_image, seo_keywords) | ✅   |
| 태그 배열 (tags[])                                                     | ✅   |
| 다국어 확장 가능 필드 (title_en 등)                                    | ✅   |

### AI 기능 확장 포인트

```
콘텐츠 필드
    ↓
AI Assistant 호출 (Supabase Edge Function)
    ↓
생성 결과 → 관리자 검토 필드에 임시 저장
    ↓
운영자 검토 → 승인 시 정식 필드에 저장
```

**v3.0 AI 기능 목록**

| 기능          | 입력            | 출력                 | 저장 위치                      |
| ------------- | --------------- | -------------------- | ------------------------------ |
| SEO 제목 생성 | 콘텐츠 전문     | seo_title 후보 3개   | 임시 → 승인 시 seo_title       |
| SEO 설명 생성 | 콘텐츠 전문     | seo_description 후보 | 임시 → 승인 시 seo_description |
| 블로그 초안   | 키워드 + 개요   | 마크다운 draft       | blog_posts.content             |
| SNS 카피 생성 | 블로그/아카이브 | 인스타/X용 텍스트    | 별도 SNS draft 테이블          |
| 이미지 추천   | 콘텐츠 context  | photo_id[]           | 수동 선택 후 적용              |
| 자동 번역     | 한국어 필드     | 영문 title_en 등     | 해당 \_en 필드                 |

**AI 확장 원칙**

- AI는 제안만 한다. 운영자 검토 없는 자동 게시는 없다.
- AI 생성 콘텐츠는 별도 `ai_draft` 플래그로 구분된다.
- AI 오류 시 기존 데이터는 절대 변경되지 않는다.

---

## 11. System 표준

### 사이트 설정 (settings 테이블)

```
key-value 구조로 모든 전역 설정 관리

site_name               → 사이트명
site_description        → 기본 SEO 설명
google_analytics_id     → GA4 ID
google_tag_manager_id   → GTM ID
naver_site_verification → 네이버 서치어드바이저
bing_site_verification  → Bing 인증
robots_txt_disallow     → robots.txt 추가 규칙
```

### 운영 정보 (operator_settings — Operator 접근 가능)

```
contact_email     → 대표 이메일
contact_phone     → 대표 전화
address           → 주소
instagram_url     → 인스타그램
youtube_url       → 유튜브
kakao_map_url     → 카카오맵
google_map_embed  → 구글맵 임베드
business_hours    → 운영시간
holiday           → 정기 휴무
```

### 사용자 관리 (profiles 테이블)

```typescript
interface Profile {
  id: UUID;
  email: string;
  full_name?: string;
  role: "super_admin" | "operator" | "viewer";
  created_at: ISODateString;
  updated_at: ISODateString;
}
```

역할 변경은 Super Admin만 가능하다. 자기 자신의 역할은 변경할 수 없다.

### RLS (Row Level Security) 표준

```sql
-- 공개 콘텐츠: published 상태만 외부 노출
CREATE POLICY "public_read" ON spaces
  FOR SELECT USING (publish_status = 'published');

-- 관리자 쓰기: 인증된 사용자만
CREATE POLICY "admin_write" ON spaces
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

역할 기반 세밀한 접근 제어는 RLS가 아닌 **프런트엔드 RoleGuard + 서버 Supabase Auth**로 처리한다.

---

## 12. Multi-Project 적용 방법

### 적용 레벨

**Level 1 — 전체 재사용** (동일 기술 스택: React + Supabase)

THE LIT 코드베이스를 그대로 복제하고 다음만 변경한다.

```
1. .env (Supabase URL, anon key)
2. 브랜드 색상 (tailwind.config.js)
3. 폰트 (index.css)
4. about_content 초기 데이터 (마이그레이션 SQL)
5. FALLBACK 상수 (도메인 특화)
```

**Level 2 — 부분 적용** (다른 기술 스택)

Framework 개념과 DB 스키마만 이식하고, 각 프로젝트 스택에 맞게 컴포넌트를 재구현한다.

```
재사용 가능한 것
├── DB 스키마 (SQL 마이그레이션)
├── 권한 체계 (역할·권한 매트릭스)
├── Brand 5구조 (Story/Journey/Philosophy/History/SEO)
├── Media 파이프라인 (stage flow)
└── AI 확장 포인트 설계

프로젝트별 커스터마이징
├── 도메인 특화 메뉴 (Wedding → Golf Round 등)
├── 색상·폰트
└── 공개 페이지 레이아웃
```

### 프로젝트별 Brand 구조 매핑

| 구조                 | THE LIT                   | SafeLyn        | GOLF DNA        | BAIKAL        |
| -------------------- | ------------------------- | -------------- | --------------- | ------------- |
| Brand Story          | 더릿의 시작               | SafeLyn 철학   | 골프 DNA 이야기 | 바이칼 소개   |
| Experience / Journey | Walk Into The Light       | Safety Journey | Golf Round Flow | 프로젝트 과정 |
| Philosophy           | Dark·Passage·Light·Memory | 안전 가치      | Golf 정신       | 개발 철학     |
| History              | 2018→2024                 | 설립→현재      | 창단→현재       | 법인→현재     |
| SEO                  | About 페이지              | 메인 페이지    | 메인 페이지     | 포트폴리오    |

### 도메인 메뉴 활성화 방법

```typescript
// 프로젝트에서 필요한 권한만 OPERATOR_PERMISSIONS에 포함
const OPERATOR_PERMISSIONS: Permission[] = [
  "dashboard",
  "brand",
  // THE LIT:  spaces, programs, archive, blog, wedding_photos
  // SafeLyn:  cases, articles, resources
  // GOLF DNA: courses, tournaments, news
];
```

---

## 13. 프로젝트 적용 체크리스트

### Phase 1 — 기반 구축 (Day 1~3)

```
□ Supabase 프로젝트 생성
□ .env 설정 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
□ 001_initial.sql 실행 (profiles, settings, RLS)
□ 첫 super_admin 계정 생성
□ 로그인 → 대시보드 접근 확인
□ Operator 계정 생성 및 권한 확인
```

### Phase 2 — Brand CMS (Day 4~7)

```
□ 009_about_content.sql 실행
□ 010_brand_intro.sql 실행
□ 019_brand_cms.sql 실행 (journey_steps, wedding_experiences, SEO)
□ /admin/brand 접근 및 저장 확인
□ 프런트 Brand Story 섹션 연결 확인
□ 프런트 Experience Journey 섹션 연결 확인
□ SEO 탭 super_admin 전용 확인
□ Fallback 동작 확인 (DB 미적용 시 하드코딩 표시)
```

### Phase 3 — Content CMS (Day 8~14)

```
□ Spaces 마이그레이션 및 관리자 확인
□ Blog(Stories) 마이그레이션 및 관리자 확인
□ is_featured → 홈페이지 Featured 섹션 연결
□ publish_status 필터 프런트 반영 확인
□ Archive 마이그레이션 및 관리자 확인
□ 도메인 특화 메뉴 추가 (필요 시)
```

### Phase 4 — Media CMS (Day 15~21)

```
□ 004~007_photos 마이그레이션 실행
□ Supabase Storage 버킷 생성 및 정책 설정
□ Photo upload → stage=web → 프런트 표시 확인
□ project_category 태그 → 페이지 자동 연결 확인
□ AI 분석 활성화 여부 결정
```

### Phase 5 — Customer & System (Day 22~28)

```
□ 003_reservation.sql 실행
□ 문의 폼 → DB 저장 → 관리자 표시 확인
□ 예약 플로우 전체 확인
□ 운영 정보 (연락처, 주소, SNS) 설정
□ Google Analytics 연결
□ SEO 기본값 설정
□ sitemap.xml / robots.txt 배포
□ Vercel 배포 확인
```

### Phase 6 — QA & 운영 이관 (Day 29~30)

```
□ TypeScript 0 errors 확인 (npx tsc --noEmit)
□ 빌드 성공 확인 (npm run build)
□ 모바일 375px 레이아웃 확인
□ 운영자 계정으로 모든 탭 기능 확인
□ Super Admin 전용 탭 숨김 확인
□ Fallback 시나리오 6가지 확인
□ 운영자 인수인계 문서 전달
□ Production 도메인 연결
```

---

## 14. 향후 Roadmap

### v2.0 (현재 — THE LIT 기준)

```
✅ 3계층 권한 시스템
✅ Brand CMS 5구조 (Story/Journey/Philosophy/History/SEO)
✅ Domain Experience CMS (Wedding/Journey)
✅ Media Pipeline (Projects/Stages/Curator)
✅ Customer Management (Inquiry/Reservation)
✅ Dashboard 3-Zone (Today / Brand Status / Content Status)
✅ Fallback-safe 콘텐츠 로직
✅ AI-Ready 데이터 구조
```

### v2.5 (운영 안정화 — 3개월 내)

```
□ 콘텐츠 미리보기 (관리자에서 프런트 미리보기)
□ 콘텐츠 복제 (아카이브, 블로그 포스트)
□ 작성자/수정자 추적 (created_by, updated_by)
□ 관리자 목록 필터 고도화 (날짜 범위, 복합 조건)
□ Dynamic Sitemap 자동 생성
□ SEO Score 표시 (제목/설명 글자수 가이드)
```

### v3.0 (AI 통합 — 6개월 내)

```
□ AI Copy Assistant (Blog 초안, 인스타 문구)
□ AI SEO Assistant (Title/Description 자동 생성)
□ AI SNS Auto-draft (카카오, 인스타, X)
□ Image Auto-recommend (콘텐츠 context 기반)
□ 자동 번역 (ko → en 필드 자동 채움)
□ Newsletter 발송 연동
□ CRM 기본 (고객 히스토리, 메모, 재방문 추적)
```

### v4.0 (플랫폼화 — 1년 내)

```
□ Multi-tenant 구조 (하나의 어드민으로 여러 사이트 관리)
□ 캠페인 관리 (할인, 이벤트, 프로모션)
□ 멤버십/구독
□ Analytics 내장 (조회수, 문의 전환율, 예약 전환율)
□ 매출 통계
□ 자동 SNS 게시 (검토 후 예약 발행)
```

---

## 빠른 참조 카드

```
새 프로젝트 시작 시 최소 구성
─────────────────────────────
1. Supabase + .env
2. Migrations: 001(초기), 009-010(Brand), 019(BrandCMS)
3. super_admin 계정 1개
4. /admin/brand → 브랜드 콘텐츠 입력
5. npm run build → 배포

3계층 역할 요약
─────────────────────────────
super_admin  → 구조·SEO·사용자·시스템
operator     → 콘텐츠·고객·운영정보
viewer       → 대시보드만

Fallback 판단 기준
─────────────────────────────
data === undefined  → FALLBACK (미로딩)
data.length === 0   → FALLBACK (설정 없음)
data.all_hidden     → 0개 표시 (운영자 의도)
```

---

_BAIKAL Admin Framework v2.0 — Based on THE LIT Production Verification_
_Authored: 2026-08-03_
