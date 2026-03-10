# The Lit — 복합문화공간 플랫폼

**thelit.kr** 공식 웹사이트 및 관리 시스템 소스코드입니다.  
공간 임대, 문화 프로그램, 아카이브, 블로그, SNS 미디어를 통합 관리하는 풀스택 플랫폼입니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [시작하기](#4-시작하기)
5. [환경변수 설정](#5-환경변수-설정)
6. [Supabase 설정](#6-supabase-설정)
7. [페이지 구성](#7-페이지-구성)
8. [어드민 CMS](#8-어드민-cms)
9. [데이터 모델](#9-데이터-모델)
10. [디자인 시스템](#10-디자인-시스템)
11. [서비스 레이어](#11-서비스-레이어)
12. [배포 (Vercel)](#12-배포-vercel)
13. [개발 가이드](#13-개발-가이드)

---

## 1. 프로젝트 개요

The Lit은 서울 마포구 연남동에 위치한 복합문화공간입니다.  
이 플랫폼은 다음 기능을 제공합니다:

| 기능 | 설명 |
|------|------|
| **브랜드 사이트** | 공간 소개, 비전, 연혁 |
| **공간 임대** | 카페·가든·스튜디오·스토리지 홀 예약 안내 |
| **문화 프로그램** | 전시·공연·강연·워크숍·이벤트 소개 및 접수 |
| **아카이브** | 지난 프로그램 기록 보관 |
| **블로그** | 큐레이션 콘텐츠 발행 |
| **미디어 허브** | YouTube·Instagram·X 통합 피드 |
| **문의/예약** | 공간 임대 및 일반 문의 접수 |
| **어드민 CMS** | 전체 콘텐츠 관리 백오피스 |

---

## 2. 기술 스택

### 프론트엔드
| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| React | 19 | UI 프레임워크 |
| TypeScript | 5.9 | 정적 타입 |
| Vite | 7 | 빌드 도구 |
| TailwindCSS | 3 | 스타일링 |
| React Router DOM | 7 | 클라이언트 라우팅 |
| TanStack Query | 5 | 서버 상태 관리 및 캐싱 |
| Framer Motion | 12 | 애니메이션 |
| React Hook Form | 7 | 폼 관리 |
| Zod | 4 | 스키마 검증 |
| date-fns | 4 | 날짜 처리 (한국어 로케일) |
| lucide-react | 최신 | 아이콘 |
| react-helmet-async | 3 | SEO 메타태그 |
| swiper | 12 | 슬라이더 |

### 백엔드 / 인프라
| 서비스 | 용도 |
|--------|------|
| Supabase | PostgreSQL DB + 인증 + Storage + RLS |
| Vercel | 호스팅 및 CDN |

---

## 3. 프로젝트 구조

```
baikal-spacehub-ai/
├── public/
│   ├── robots.txt              # 검색엔진 크롤링 규칙
│   └── sitemap.xml             # SEO 사이트맵
├── src/
│   ├── main.tsx                # 앱 진입점
│   ├── App.tsx                 # 라우터 + 전역 프로바이더
│   ├── index.css               # 전역 CSS (Tailwind + 커스텀)
│   ├── types/
│   │   └── index.ts            # 전체 TypeScript 타입 정의
│   ├── lib/
│   │   └── supabase.ts         # Supabase 클라이언트 초기화
│   ├── services/               # Supabase CRUD 서비스
│   │   ├── spaces.ts
│   │   ├── programs.ts
│   │   ├── archive.ts
│   │   ├── blog.ts
│   │   ├── media.ts
│   │   └── inquiries.ts
│   ├── hooks/
│   │   └── useData.ts          # React Query 훅 모음
│   ├── layouts/
│   │   ├── MainLayout.tsx      # 퍼블릭 레이아웃 (Header + Footer)
│   │   └── AdminLayout.tsx     # 어드민 레이아웃 (사이드바)
│   ├── components/
│   │   ├── common/             # 공통 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AnimatedSection.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── OptimizedImage.tsx
│   │   │   └── SectionHeader.tsx
│   │   └── home/               # 홈페이지 섹션 컴포넌트
│   │       ├── HeroSection.tsx
│   │       ├── BrandIntroSection.tsx
│   │       ├── SpacesPreviewSection.tsx
│   │       ├── UpcomingProgramsSection.tsx
│   │       ├── ArchiveHighlightsSection.tsx
│   │       ├── MediaFeedSection.tsx
│   │       ├── CollaborationSection.tsx
│   │       └── LocationSection.tsx
│   └── pages/
│       ├── HomePage.tsx
│       ├── SpacesPage.tsx
│       ├── SpaceDetailPage.tsx
│       ├── ProgramsPage.tsx
│       ├── ProgramDetailPage.tsx
│       ├── ArchivePage.tsx
│       ├── BlogPage.tsx
│       ├── BlogPostPage.tsx
│       ├── MediaPage.tsx
│       ├── AboutPage.tsx
│       ├── ContactPage.tsx
│       └── admin/
│           ├── AdminLoginPage.tsx
│           ├── AdminDashboard.tsx
│           ├── AdminSpacesPage.tsx
│           ├── AdminProgramsPage.tsx
│           ├── AdminArchivePage.tsx
│           ├── AdminBlogPage.tsx
│           ├── AdminMediaPage.tsx
│           ├── AdminInquiriesPage.tsx
│           └── AdminSettingsPage.tsx
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # DB 스키마 + RLS 정책
├── .env.example                # 환경변수 템플릿
├── vercel.json                 # Vercel SPA 라우팅 설정
├── tailwind.config.js          # 브랜드 디자인 토큰
├── vite.config.ts
└── tsconfig.app.json
```

---

## 4. 시작하기

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Supabase 계정 (선택 — 없으면 fallback 데이터로 동작)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

> **Supabase 없이도 실행 가능합니다.**  
> 환경변수 미설정 시 각 페이지는 내장된 fallback 더미 데이터로 표시됩니다.

---

## 5. 환경변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 값을 입력합니다.

```bash
copy .env.example .env.local
```

```env
# .env.local

# Supabase 프로젝트 URL (Supabase 대시보드 > Settings > API)
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Supabase anon/public 키
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> `VITE_` 접두사가 없으면 브라우저에서 접근 불가합니다. 절대 `service_role` 키를 프론트에 노출하지 마세요.

---

## 6. Supabase 설정

### 6-1. 프로젝트 생성
1. [supabase.com](https://supabase.com) 접속 → New Project 생성
2. Settings → API에서 URL과 anon key 복사 → `.env.local`에 입력

### 6-2. DB 스키마 적용
Supabase 대시보드 → **SQL Editor** → `supabase/migrations/001_initial.sql` 전체 내용 붙여넣기 → Run

생성되는 테이블:

| 테이블 | 설명 |
|--------|------|
| `profiles` | 어드민 사용자 (auth.users 연동) |
| `spaces` | 공간 정보 |
| `programs` | 문화 프로그램 |
| `archive_items` | 아카이브 기록 |
| `blog_categories` | 블로그 카테고리 |
| `blog_posts` | 블로그 포스트 |
| `media_items` | 미디어 피드 (YouTube/Instagram/X) |
| `inquiries` | 문의/예약 신청 |
| `settings` | 사이트 설정 키-값 |

### 6-3. 어드민 계정 생성
1. Supabase 대시보드 → Authentication → Users → Invite user
2. SQL Editor에서 해당 유저의 role을 admin으로 변경:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 6-4. Row Level Security
모든 테이블에 RLS가 활성화되어 있습니다.
- **공개 데이터** (spaces, programs 등): 누구나 읽기 가능
- **쓰기/수정/삭제**: `is_admin()` 함수로 admin 역할만 허용
- **문의**: 누구나 INSERT 가능, admin만 SELECT/UPDATE

---

## 7. 페이지 구성

| URL | 페이지 | 설명 |
|-----|--------|------|
| `/` | 홈 | 히어로, 브랜드 소개, 공간 프리뷰, 예정 프로그램, 아카이브, 미디어, 위치 |
| `/spaces` | 공간 목록 | 전체 공간 카드 리스트 |
| `/spaces/:slug` | 공간 상세 | 이미지 갤러리, 시설, 가격, 예약 문의 |
| `/programs` | 프로그램 목록 | 카테고리·상태 필터, 그리드 뷰 |
| `/programs/:slug` | 프로그램 상세 | 상세 설명, 일정, 신청 링크 |
| `/archive` | 아카이브 | 지난 프로그램 기록 |
| `/blog` | 블로그 | 포스트 목록, 카테고리 필터 |
| `/blog/:slug` | 블로그 포스트 | 마크다운 렌더링 콘텐츠 |
| `/media` | 미디어 허브 | YouTube·Instagram·X 통합 피드 |
| `/about` | 어바웃 | 공간 스토리, 팀, 비전 |
| `/contact` | 컨택트 | 문의 폼, 지도, 위치 안내 |

### 라우트 보호
`/admin/*` 경로는 `RequireAuth` 컴포넌트로 보호됩니다.  
Supabase 세션이 없으면 `/admin/login`으로 리다이렉트됩니다.

---

## 8. 어드민 CMS

`/admin/login` → 로그인 후 `/admin` 대시보드 진입

| URL | 페이지 | 기능 |
|-----|--------|------|
| `/admin` | 대시보드 | 통계 카드, 미처리 문의, 빠른 이동 |
| `/admin/spaces` | 공간 관리 | 공간 추가·수정·삭제, 이미지 URL 관리 |
| `/admin/programs` | 프로그램 관리 | 프로그램 CRUD, 상태·카테고리 설정 |
| `/admin/archive` | 아카이브 관리 | 아카이브 항목 CRUD |
| `/admin/blog` | 블로그 관리 | 포스트 작성·수정·삭제, 발행 상태 |
| `/admin/media` | 미디어 관리 | YouTube·Instagram·X 링크 등록 |
| `/admin/inquiries` | 문의 관리 | 문의 목록, 상태 변경, 메모 |
| `/admin/settings` | 사이트 설정 | 키-값 형태 사이트 설정 편집 |

---

## 9. 데이터 모델

### Space (공간)
```typescript
interface Space {
  id: UUID;
  slug: string;           // URL 식별자 (예: 'cafe', 'garden')
  name: string;           // 한국어 이름
  name_en?: string;       // 영문 이름
  category: 'cafe' | 'garden' | 'studio' | 'storage' | 'hall' | 'other';
  capacity?: number;      // 수용 인원
  size_sqm?: number;      // 면적 (㎡)
  rental_price_per_hour?: number;  // 시간당 대관료
  features?: string[];    // 시설/특징 태그
  is_available: boolean;  // 예약 가능 여부
}
```

### Program (프로그램)
```typescript
interface Program {
  id: UUID;
  slug: string;
  title: string;
  category: 'exhibition' | 'performance' | 'lecture' | 'workshop' | 'event';
  status: 'upcoming' | 'ongoing' | 'closed' | 'cancelled';
  start_date?: string;    // ISO 날짜 문자열
  end_date?: string;
  is_free?: boolean;
  price?: number;
  registration_url?: string;
  is_featured: boolean;
}
```

### BlogPost (블로그)
```typescript
interface BlogPost {
  id: UUID;
  slug: string;
  title: string;
  content: string;        // 마크다운
  is_published: boolean;
  is_featured: boolean;
  cover_image_url?: string;
  view_count: number;
}
```

### MediaItem (미디어)
```typescript
interface MediaItem {
  id: UUID;
  platform: 'youtube' | 'instagram' | 'x';
  url: string;            // 원본 URL
  title?: string;
  thumbnail_url?: string;
  is_featured: boolean;
}
```

### Inquiry (문의)
```typescript
interface Inquiry {
  id: UUID;
  inquiry_type: 'space_rental' | 'program' | 'collaboration' | 'other';
  status: 'pending' | 'reviewing' | 'resolved' | 'closed';
  name: string;
  email?: string;
  phone?: string;
  message: string;
}
```

---

## 10. 디자인 시스템

### 브랜드 컬러
| 토큰 | 색상 | 헥스 |
|------|------|------|
| `brand-black` | 메인 블랙 | `#0A0A0A` |
| `brand-white` | 배경 화이트 | `#FAFAFA` |
| `brand-cream` | 크림 베이지 | `#F5F0EB` |
| `brand-warm` | 웜 베이지 | `#E8DDD0` |
| `brand-accent` | 골드 악센트 | `#C8A97E` |
| `brand-muted` | 뮤트 그레이 | `#6B6B6B` |
| `brand-border` | 경계선 | `#E0E0E0` |

### 타이포그래피
| 폰트 패밀리 | 클래스 | 용도 |
|------------|--------|------|
| Cormorant Garamond | `font-display` | 제목, 디스플레이 텍스트 |
| Inter + Pretendard | `font-sans` | 본문, UI 텍스트 |
| Playfair Display | `font-serif` | 인용, 강조 |

### 유틸리티 클래스
```css
.container-wide    /* max-w-[1440px] 중앙 정렬 컨테이너 */
.container-narrow  /* max-w-[960px] 좁은 컨테이너 */
.section-padding   /* 반응형 상하 패딩 */
.btn-primary       /* 검정 배경 CTA 버튼 */
.btn-secondary     /* 아웃라인 버튼 */
.btn-accent        /* 골드 악센트 버튼 */
.eyebrow           /* 소제목 레이블 (대문자 추적) */
.section-title     /* 크고 얇은 디스플레이 제목 */
.form-input        /* 언더라인 스타일 인풋 */
.tag               /* 작은 태그 뱃지 */
```

### 애니메이션
`AnimatedSection` 컴포넌트로 스크롤 기반 진입 애니메이션 적용:
```tsx
<AnimatedSection animation="fade-up" delay={200}>
  <YourComponent />
</AnimatedSection>
```
지원 애니메이션: `fade-up` · `fade-in` · `slide-left` · `slide-right` · `scale-in`

---

## 11. 서비스 레이어

`src/services/` 폴더의 각 서비스는 Supabase CRUD를 추상화합니다.

```typescript
// 사용 예시 (직접 호출)
import { spacesService } from './services/spaces'

const spaces = await spacesService.getAll({ category: 'cafe' })
const space  = await spacesService.getBySlug('cafe-lounge')
await spacesService.create({ name: '루프탑', slug: 'rooftop', ... })
await spacesService.update('uuid', { is_available: false })
await spacesService.delete('uuid')
```

```typescript
// React 컴포넌트에서 (React Query 훅 사용 권장)
import { useSpaces, useSpace } from './hooks/useData'

function SpaceList() {
  const { data: spaces, isLoading } = useSpaces({ category: 'cafe' })
  // ...
}
```

### 캐시 전략 (staleTime)
| 데이터 | staleTime |
|--------|-----------|
| 공간 | 5분 |
| 프로그램 | 2분 |
| 아카이브 | 10분 |
| 블로그 | 2분 |
| 블로그 카테고리 | 30분 |
| 미디어 | 5분 |
| 문의 | 1분 |

---

## 12. 배포 (Vercel)

### 최초 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel deploy
```

### 환경변수 등록
Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:

| 키 | 값 |
|----|-----|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 키 |

### SPA 라우팅
`vercel.json`에 SPA 폴백이 설정되어 있어 `/programs/slug` 같은 딥링크가 정상 동작합니다:
```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

### 프로덕션 빌드 확인
```bash
npm run build   # TypeScript 검사 + Vite 번들링
npm run preview # 빌드 결과물 로컬 미리보기
```

---

## 13. 개발 가이드

### 새 페이지 추가
1. `src/pages/NewPage.tsx` 생성
2. `src/App.tsx`에 `<Route path="/new" element={<NewPage />} />` 추가
3. 필요 시 `Header.tsx`의 네비게이션 링크에 추가

### 새 데이터 타입 추가
1. `src/types/index.ts`에 인터페이스 추가
2. `supabase/migrations/`에 새 마이그레이션 SQL 파일 작성
3. `src/services/`에 서비스 파일 작성
4. `src/hooks/useData.ts`에 React Query 훅 추가

### 커밋 컨벤션
```
feat: 새 기능
fix: 버그 수정
style: 스타일 변경
refactor: 리팩토링
docs: 문서 수정
chore: 설정, 패키지 관련
```

### 브랜치 전략
```
main        → 프로덕션 (Vercel 자동 배포)
dev         → 개발 통합
feat/xxx    → 기능 개발
fix/xxx     → 버그 수정
```

---

## 문의

- 이메일: hello@thelit.kr
- 주소: 서울특별시 마포구 연남동 000-00
- 전화: 02-0000-0000
