# THE LIT — Experience First Upgrade
## IA & Content Design v1.0

> 코드 없음. IA·콘텐츠·카피·SEO·구현 우선순위 설계서.
> 기존 컴포넌트 최대 재사용 / 최소 수정 원칙.

---

## 1. IA 변경안

### 현행 내비게이션
```
About / Spaces / Wedding / Archive / Media / Blog / Contact
```

### 변경 후 내비게이션
```
Brand Story / Spaces / Wedding / History / Media / Stories / Contact
```

| 현행 | 변경 | 변경 방식 | URL 변경 |
|------|------|-----------|----------|
| About | Brand Story | 페이지 내부 재구성 | `/about` → `/about` (유지) |
| Spaces | Spaces | 상세 페이지 콘텐츠 보강 | 유지 |
| Wedding | Wedding | 섹션 재구성 | 유지 |
| Archive | History | 레이블 변경 + Timeline 뷰 추가 | `/archive` → `/history` |
| Media | Media | 유지 | 유지 |
| Blog | Stories | 레이블 변경 | `/blog` → `/stories` |
| Contact | Contact | 유지 | 유지 |

> **URL 변경 주의**: `/archive` → `/history`, `/blog` → `/stories`는
> React Router route 정의 + `vercel.json` 리다이렉트 + sitemap 동시 업데이트 필요.
> 기존 SEO 링크 유지를 위해 301 리다이렉트 필수.

### 전체 사이트 IA
```
THE LIT
│
├── Home                     ← Experience First 재설계
│   ├── Hero
│   ├── [신규] Experience Journey
│   ├── Brand Story (기존 BrandIntroSection 교체)
│   ├── Spaces Preview
│   ├── Archive Highlights → History Highlights
│   ├── Media Feed
│   ├── Collaboration
│   └── Location
│
├── Brand Story (/about)     ← About 페이지 전면 재구성
│   ├── Hero
│   ├── Why THE LIT
│   ├── Light Philosophy
│   ├── The Journey (30m Passage)
│   ├── Founder Philosophy
│   └── History Timeline
│
├── Spaces (/spaces)         ← 경험 중심 재프레이밍
│   ├── Cafe
│   ├── Garden
│   ├── Studio
│   ├── Box Room
│   └── Rooftop
│   └── 각 공간 상세 (/spaces/:slug)
│       ├── Story
│       ├── Experience
│       ├── Recommended Event
│       └── CTA
│
├── Wedding (/wedding)       ← 3가지 경험 트랙 재구성
│   ├── House Wedding
│   ├── Garden Wedding
│   └── Studio Wedding
│
├── History (/history)       ← Archive 리브랜딩 + Timeline
│   ├── Music Video
│   ├── Drama
│   ├── CF
│   ├── Brand Event
│   ├── Corporate Event
│   └── Wedding
│
├── Media (/media)           ← 유지
│
├── Stories (/stories)       ← Blog 리브랜딩
│   └── 상세 (/stories/:slug)
│
└── Contact (/contact)       ← 유지
```

---

## 2. 신규 섹션 — Home Experience Journey

### 섹션 위치
`HeroSection` 직후, `BrandIntroSection` 이전에 삽입.

### 컴포넌트 재사용 전략
- `AnimatedSection` (fade-up) — 기존 재사용
- `SectionHeader` (eyebrow + title + subtitle) — 기존 재사용
- 레이아웃: 세로 스크롤 스텝 카드 (기존 grid/flex 패턴)
- 새 컴포넌트명: `ExperienceJourneySection`

### 섹션 콘텐츠 설계

**Eyebrow:** `The Passage of Transformation`
**Title:** `30m, 어둠에서 빛으로`
**Subtitle:** `골목을 걸어 들어오는 순간, 당신의 경험이 시작됩니다.`

### 여정 8단계 (스텝 카드)

| # | 스텝 | 영문 | 감정 톤 | 한 줄 설명 |
|---|------|------|---------|-----------|
| 1 | 골목 | The Alley | 일상 → 호기심 | 골목 끝, 무언가 있다는 예감. |
| 2 | 붉은 대문 | The Red Gate | 설렘 | 처음으로 열리는 문. |
| 3 | 살구나무 | The Apricot Tree | 따뜻함 | 계절을 기억하는 나무가 당신을 맞는다. |
| 4 | Dark Passage | Dark Passage | 전환 | 어둠을 통과해야 빛이 보인다. |
| 5 | 스튜디오 | The Studio | 발견 | 낡은 창고가 예술의 공간으로. |
| 6 | 빛의 정원 | Light Garden | 해방감 | 하늘이 열리고 빛이 쏟아지는 정원. |
| 7 | 카페 | The Cafe | 따뜻한 여운 | 빛 속에서 머무르는 시간. |
| 8 | 기억 | Memory | 완성 | 이 경험은 당신 안에 남는다. |

**감정 흐름 표기 (섹션 상단 또는 하단 레이블):**
```
Dark → Curiosity → Transformation → Light → WOW
```

---

## 3. 수정 페이지 설계

---

### 3-A. Brand Story 페이지 (`/about`)

**기존 AboutPage 섹션 구조:**
```
Hero → Mission → Story → Timeline → Brand Values → CTA
```

**변경 후 섹션 구조:**
```
Hero → Why THE LIT → Light Philosophy → The Journey → Founder Philosophy → History Timeline
```

기존 `story_*` 필드 → Why THE LIT 재매핑  
기존 `mission_*` 필드 → Light Philosophy 재매핑  
기존 `timeline` → History Timeline 유지  
기존 `brand_values` → The Journey 카드로 시각화 또는 유지  

#### Hero 카피
```
Eyebrow: Brand Story
Title Line 1: 빛을 향해
Title Line 2: 걷는 이야기
```

#### Why THE LIT 섹션
```
Eyebrow: Why THE LIT
Title: 우리는 왜 이 공간을 만들었나
Body:
더릿은 공간을 짓지 않았습니다.
경험을 설계했습니다.

서울의 오래된 골목 안, 아무도 주목하지 않던 한 채의 집이 있었습니다.
우리는 그 집이 가진 '어둠과 빛'의 대비 속에서 하나의 여정을 발견했습니다.

들어오는 사람은 모두 같은 경험을 합니다.
골목, 대문, 어둠, 그리고 빛.
그것이 더릿입니다.
```

#### Light Philosophy 섹션
```
Eyebrow: Light Philosophy
Title Line 1: 어둠이 있어야
Title Line 2: 빛이 빛난다

필러 3개:
1. Dark — 어둠은 공포가 아니라 가능성이다
2. Passage — 통과하는 과정이 경험을 완성한다
3. Light — 빛은 결과가 아니라 상태다
```

#### The Journey 섹션 (30m Passage 핵심 브랜드 콘텐츠)
```
Eyebrow: The Passage of Transformation
Title: 30m, 한 편의 이야기

30m의 골목이 연출하는 감각적 여정.
이 공간에서의 모든 경험은 이 여정에서 시작됩니다.

[8단계 여정 — Home의 ExperienceJourneySection과 동일 스텝 구조 재사용]
```

#### Founder Philosophy 섹션
```
Eyebrow: Founder Philosophy
Title: Why We Built THE LIT

"저는 공간을 다르게 경험하고 싶었습니다.
들어서는 순간부터 나가는 순간까지,
그 사이의 모든 감각이 하나의 이야기가 되는 곳.

더릿은 그 실험의 결과입니다."

[CMS의 story_paragraph 필드를 Founder Philosophy로 레이블 재매핑]
```

#### History Timeline (기존 유지)
```
기존 timeline 필드 그대로 재사용.
섹션 타이틀만 변경:
Eyebrow: "History"
Title: "지나온 시간들"
```

---

### 3-B. Spaces 상세 페이지 (`/spaces/:slug`)

**기존 SpaceDetailPage 구조:**
```
Hero → Description → Features → Recommended Use → Gallery → CTA
```

**변경 후 구조 (콘텐츠 보강, 레이아웃 유지):**
```
Hero → Story → Experience → Features → Recommended Event → Gallery → CTA
```

각 공간별 `description` 필드를 Story/Experience 분리 서술로 교체:

#### Cafe — 카페
```
Story:
커피 향과 책 향기가 섞이는 곳.
골목을 지나 빛의 정원으로 이어지는 이 카페는
더릿 경험의 시작점이자 끝점입니다.

Experience:
이 공간에서 당신은 아침의 첫 커피처럼
무언가의 시작을 경험합니다.

Recommended Event: 낭독회 / 소셜 나이트 / 팝업 마켓 / 브랜드 쇼룸
CTA: "카페 경험하기" → /contact
```

#### Garden — 빛의 정원
```
Story:
담장 너머 갑자기 열리는 하늘.
살구나무 아래, 사계절이 다른 표정을 가진 정원.

Experience:
어둠의 통로를 지나 처음 빛을 만나는 순간의 공간.
이 해방감이 더릿의 WOW 포인트입니다.

Recommended Event: 웨딩 리셉션 / 가든 파티 / 야외 공연 / 브랜드 런칭
CTA: "가든 경험하기" → /contact
```

#### Studio — 스튜디오
```
Story:
낡은 창고를 해체하고 다시 세운 흰 공간.
아무것도 없는 듯 보이지만 모든 가능성이 열려 있습니다.

Experience:
여기서 찍히는 모든 것은 더릿의 빛을 담습니다.
사이클로라마 너머 자연광이 쏟아지는 유일한 스튜디오.

Recommended Event: 뮤직비디오 / 화보 촬영 / CF / 소규모 공연
CTA: "스튜디오 경험하기" → /contact
```

#### Box Room — 박스룸
```
Story:
가장 작고 가장 집중된 공간.
두 사람, 혹은 열 사람이 완벽하게 몰입하는 방.

Experience:
외부 소음이 사라지고 오직 우리의 이야기만 남는 공간.

Recommended Event: 프라이빗 미팅 / 인터뷰 촬영 / 소규모 세미나
CTA: "박스룸 경험하기" → /contact
```

#### Rooftop — 루프탑
```
Story:
서울의 지붕 위에서, 더릿 전체를 내려다보는 시각.
밤이 되면 하늘과 도시가 하나가 되는 곳.

Experience:
여정의 마지막, 가장 높은 곳에서 내려다보는 더릿.
이 풍경이 기억으로 남습니다.

Recommended Event: 선셋 파티 / 루프탑 다이닝 / 음악 행사
CTA: "루프탑 경험하기" → /contact
```

---

### 3-C. Wedding 페이지 (`/wedding`)

**기존 갤러리 탭:**
```
전체 / 세레모니 / 리셉션 / 가든 / 인도어 / 나이트 / 디테일
```

**변경 후 — 3가지 경험 트랙:**
```
House Wedding / Garden Wedding / Studio Wedding
```

기존 탭 필터 컴포넌트 재사용, 탭 레이블과 카테고리 매핑만 변경.

| 경험 트랙 | 설명 | 연결 공간 | 분위기 키워드 |
|-----------|------|-----------|--------------|
| House Wedding | 더릿 전체를 하나의 집으로 — 가장 친밀하고 따뜻한 웨딩 | 카페 + 가든 + 홀 | Intimate, Warm, Story |
| Garden Wedding | 살구나무 아래, 빛의 정원에서의 서약 | 가든 + 루프탑 | Natural, Light, Open |
| Studio Wedding | 흰 공간의 순수함 — 가장 모던하고 포토제닉한 웨딩 | 스튜디오 + 박스룸 | Minimal, Modern, Photogenic |

각 트랙별 콘텐츠 구성:
```
[트랙명]
Experience: 한 줄 경험 서술
Space: 사용 공간
Capacity: 수용 인원
Mood: 분위기 키워드 3개
Gallery: 관련 사진 필터
CTA: "웨딩 상담 신청" → /contact
```

**Hero 카피 변경:**
```
기존: 웨딩 페이지 헤더
변경:
Eyebrow: Wedding at THE LIT
Title Line 1: 빛 속에서
Title Line 2: 우리의 이야기를
Subtitle: 더릿의 세 가지 웨딩 경험
```

---

### 3-D. History 페이지 (`/history` ← 기존 `/archive`)

**기존 Archive 구조:**
```
Category filter (전체 / 전시 / 공연 / 행사 / 워크샵) + Grid Card
```

**변경 후:**
```
Timeline Header + Category filter (재설계) + Grid/Timeline Card
```

**카테고리 재설계:**
```
전체 / Music Video / Drama & Film / CF & Commercial / Brand Event / Corporate / Wedding
```

기존 `category` 필드값 매핑:
| 기존 category | 변경 레이블 |
|--------------|------------|
| photoshoot | Music Video / Drama / CF (서브태그로 분기) |
| event | Brand Event / Corporate |
| performance | 유지 또는 Brand Event 통합 |
| exhibition | 유지 |
| workshop | 유지 |

**페이지 헤더 카피:**
```
Eyebrow: History
Title: 더릿을 채운 이야기들
Subtitle: 2019년부터 더릿을 무대로 삼은 모든 순간의 기록
```

**Timeline 뷰 (선택적 뷰 모드):**
- 기존 Grid 카드 유지
- 연도별 Timeline 헤더 라인 추가 (CSS/레이아웃 수준)
- 연도 구분자: `2019 · 2020 · 2021 · 2022 · 2023 · 2024 · 2025 · 2026`

---

### 3-E. Stories 페이지 (`/stories` ← 기존 `/blog`)

**기존 Blog 카테고리:**
```
문화 리뷰 / 행사 후기 / 공간 스토리 / 인터뷰 / 기타
```

**변경 후 — THE LIT Stories 시리즈:**
```
All / Space Stories / Brand Journal / Behind the Scene / Interview / Culture Review
```

| 시리즈명 | 설명 | 기존 매핑 |
|---------|------|-----------|
| Space Stories | 공간에 대한 이야기 | 공간 스토리 |
| Brand Journal | 더릿 브랜드 철학과 기록 | 기타 → 에디토리얼 |
| Behind the Scene | 행사 뒷이야기 | 행사 후기 |
| Interview | 아티스트·게스트 인터뷰 | 인터뷰 |
| Culture Review | 문화·예술 리뷰 | 문화 리뷰 |

**페이지 헤더 카피:**
```
Eyebrow: THE LIT Stories
Title: 빛 속에서 태어난 이야기들
Subtitle: 더릿을 거쳐간 사람들, 공간들, 그리고 순간들의 기록
```

---

## 4. UX 흐름

### Home 감정 여정 (스크롤 순서)

```
[Hero]
"어둠과 빛 사이, 당신의 경험이 시작됩니다."
→ 첫 인상: 호기심 + 미적 충격

↓ scroll

[Experience Journey — 신규]
30m 여정 8단계
→ 감정: Dark → Curiosity → Transformation → Light → WOW
→ 브랜드 아이덴티티 체감

↓ scroll

[Brand Story (기존 BrandIntroSection 교체)]
Why THE LIT + Light Philosophy 3 pillars
→ 감정: 이해 + 공감

↓ scroll

[Spaces Preview]
5개 공간 카드 (경험 중심 한 줄 서술)
→ 감정: 탐색 욕구

↓ scroll

[History Highlights (기존 Archive Highlights 재레이블)]
실제 행사 기록 4개
→ 감정: 신뢰 + 사회적 증명

↓ scroll

[Media Feed]
인스타그램 피드
→ 감정: 연결 + 현재성

↓ scroll

[Collaboration]
파트너/클라이언트 로고
→ 감정: 신뢰

↓ scroll

[Location + CTA]
"Experience THE LIT"
→ 행동: 예약/문의
```

### 브랜드 스토리 방문 경로
```
Home Hero CTA "Walk Into The Light"
  → /about (Brand Story)
     → "The Journey" 섹션 앵커
        → 30m Passage 8단계
           → CTA: "Experience THE LIT"
              → /contact
```

### 공간 탐색 경로
```
Home Spaces Preview "Explore Spaces"
  → /spaces
     → 공간 선택
        → /spaces/:slug
           → Story → Experience → CTA
              → /contact
```

---

## 5. 핵심 카피

### 브랜드 원 라이너
```
THE LIT — Walk Into The Light.
```

### 사이트 메인 슬로건 (Hero)
```
어둠을 지나면 빛이 있습니다.
그 30m가 THE LIT입니다.
```

### 브랜드 서브라인
```
서울 한복판, 골목 안의 빛.
```

### 섹션별 핵심 카피

| 섹션 | 카피 |
|------|------|
| Experience Journey Eyebrow | The Passage of Transformation |
| Experience Journey Title | 30m, 어둠에서 빛으로 |
| Experience Journey Subtitle | 골목을 걸어 들어오는 순간, 당신의 경험이 시작됩니다. |
| Brand Story Eyebrow | Why THE LIT |
| Brand Story Title | 우리는 공간이 아니라 경험을 만들었습니다 |
| Light Philosophy | 어둠이 있어야 빛이 빛난다 |
| 30m Passage | 30m, 한 편의 이야기 |
| Founder Quote | "들어서는 순간부터 나가는 순간까지, 그 사이의 모든 감각이 하나의 이야기가 되는 곳." |
| Spaces Hero | 공간이 아니라 경험을 고르세요 |
| Wedding Hero | 빛 속에서, 우리의 이야기를 |
| History Title | 더릿을 채운 이야기들 |
| Stories Title | 빛 속에서 태어난 이야기들 |

### 감정 흐름 5단계 레이블
```
Dark / Curiosity / Transformation / Light / WOW
```

---

## 6. CTA 재설계

### 원칙
예약 중심 → 경험 중심. 방문 욕구 유발.

### CTA 전체 목록

| 위치 | 기존 | 변경 |
|------|------|------|
| Home Hero Primary | 공간 보기 / 예약 문의 | **Walk Into The Light** |
| Home Hero Secondary | — | **Explore Our Spaces** |
| Experience Journey 하단 | — | **Experience THE LIT** |
| Brand Story 하단 | 아카이브 보기 | **Walk Into The Light** |
| About (Brand Story 페이지) CTA | 문의하기 | **Experience THE LIT** |
| Spaces 목록 각 카드 | 자세히 보기 | **Discover the Space** |
| Space 상세 CTA | 예약/문의 | **Experience This Space** |
| Wedding Hero | 웨딩 문의 | **Begin Your Story** |
| Wedding 각 트랙 CTA | 문의하기 | **Plan Your Wedding** |
| History/Archive 하단 | — | **View Full History** |
| Stories/Blog 하단 | — | **Read More Stories** |
| Contact 페이지 제목 | 문의하기 | **Start Your Experience** |
| Footer 주 CTA | — | **Experience THE LIT** |

### CTA 버튼 계층
```
Primary (filled):    Experience THE LIT / Walk Into The Light
Secondary (ghost):   Explore Our Spaces / Discover the Space
Tertiary (text):     Learn More / Read More Stories / View Full History
```

---

## 7. SEO 설계

### 페이지별 SEO

#### Home (`/`)
```
Title: THE LIT — Walk Into The Light | 서울 복합문화공간
Description: 골목 끝, 빛을 향해 걷는 브랜드 경험 공간 THE LIT. 카페·정원·스튜디오·홀이 하나의 30m 여정으로 연결됩니다. 촬영·웨딩·브랜드 행사·전시·공연.
OG Title: THE LIT — Walk Into The Light
OG Description: 어둠을 지나면 빛이 있습니다. 그 30m가 THE LIT입니다.
Keywords: 복합문화공간, 더릿, The Lit, 서울 스튜디오, 하남 웨딩, 촬영 공간, 브랜드 행사 장소, 문화 공간 대여
```

#### Brand Story (`/about`)
```
Title: Brand Story — THE LIT | 빛을 향해 걷는 이야기
Description: THE LIT를 만든 이유, 빛의 철학, 30m의 여정. 더릿 브랜드 스토리와 창립 철학을 소개합니다.
OG Title: THE LIT Brand Story — Walk Into The Light
OG Description: 골목, 대문, 어둠, 그리고 빛. 더릿이 공간이 아닌 경험을 설계한 이유.
Keywords: 더릿 브랜드 스토리, 복합문화공간 철학, THE LIT 창립 이야기, 빛의 철학
```

#### Spaces (`/spaces`)
```
Title: Spaces — THE LIT | 경험으로 만나는 5가지 공간
Description: 카페·정원·스튜디오·박스룸·루프탑. THE LIT의 다섯 공간은 각기 다른 경험을 선사합니다. 촬영·행사·웨딩·소규모 모임에 최적.
OG Title: THE LIT Spaces — 경험으로 만나는 공간
Keywords: 더릿 공간, 스튜디오 대여, 카페 대관, 가든 웨딩, 루프탑 파티, 촬영 스튜디오 서울
```

#### Space Detail — Cafe (`/spaces/cafe`)
```
Title: Cafe — THE LIT | 빛이 머무는 카페 공간
Description: 커피 향과 자연광이 가득한 더릿 카페. 낭독회·소셜 나이트·팝업 마켓·브랜드 쇼룸에 최적.
```

#### Space Detail — Garden (`/spaces/garden`)
```
Title: Garden — THE LIT | 살구나무와 빛의 정원
Description: 담장 너머 갑자기 열리는 하늘, 사계절 다른 표정의 더릿 가든. 웨딩·가든 파티·야외 공연.
```

#### Space Detail — Studio (`/spaces/studio`)
```
Title: Studio — THE LIT | 자연광이 쏟아지는 화이트 스튜디오
Description: 사이클로라마와 자연광의 완벽한 조화. 뮤직비디오·화보·CF·소규모 공연을 위한 더릿 스튜디오.
Keywords: 스튜디오 대여, 사이클로라마 스튜디오, 자연광 스튜디오, 뮤직비디오 촬영 장소, 화보 촬영 서울
```

#### Wedding (`/wedding`)
```
Title: Wedding at THE LIT | House · Garden · Studio Wedding
Description: 더릿의 세 가지 웨딩 경험 — House Wedding, Garden Wedding, Studio Wedding. 빛 속에서, 우리의 이야기를.
OG Title: Wedding at THE LIT — 빛 속에서, 우리의 이야기를
OG Description: 골목 끝 빛의 정원에서의 서약. 더릿만의 세 가지 웨딩 경험.
Keywords: 더릿 웨딩, 가든 웨딩, 스몰 웨딩, 하우스 웨딩, 서울 야외 웨딩, 스튜디오 웨딩
```

#### History (`/history`)
```
Title: History — THE LIT | 더릿을 채운 이야기들
Description: 2019년부터 더릿을 무대로 삼은 뮤직비디오·드라마·CF·브랜드 행사·웨딩의 모든 기록.
OG Title: THE LIT History — 더릿을 채운 이야기들
Keywords: 더릿 촬영 이력, 뮤직비디오 촬영 장소, 드라마 촬영 장소, CF 촬영 서울, 브랜드 행사 이력
```

#### Stories (`/stories`)
```
Title: Stories — THE LIT | 빛 속에서 태어난 이야기들
Description: 더릿을 거쳐간 사람들, 공간들, 그리고 순간들의 기록. Space Stories · Brand Journal · Interview · Culture Review.
OG Title: THE LIT Stories — 빛 속에서 태어난 이야기들
Keywords: 더릿 블로그, 복합문화공간 이야기, 공간 스토리, 더릿 인터뷰
```

#### Contact (`/contact`)
```
Title: Contact — THE LIT | Start Your Experience
Description: THE LIT 공간 문의, 촬영 예약, 웨딩 상담, 행사 기획. 담당자가 1영업일 내 연락드립니다.
Keywords: 더릿 예약, 공간 문의, 촬영 대관, 웨딩 상담, 행사 장소 문의
```

---

## 8. 구현 우선순위

### Phase 1 — 최소 수정, 최대 효과 (1~2일)
> 코드 없음. CMS(Supabase) 데이터 변경만.

| # | 항목 | 방법 | 영향 범위 |
|---|------|------|----------|
| 1 | Home Hero 카피 변경 | CMS hero_slides 데이터 수정 | Home Hero |
| 2 | BrandIntroSection 카피 변경 | CMS about_content 수정 | Home + About |
| 3 | About 페이지 카피 재작성 | CMS about_content 수정 | About 전체 |
| 4 | Space 상세 description 재작성 | CMS spaces 레코드 수정 | Spaces 상세 |
| 5 | Archive → History 레이블 변경 | CMS + SeoHead 카피 수정 | Archive 페이지 |

### Phase 2 — 신규 섹션 추가 (2~3일)
> 컴포넌트 신규 작성 1개 + 기존 패턴 활용

| # | 항목 | 방법 | 영향 범위 |
|---|------|------|----------|
| 6 | `ExperienceJourneySection` 신규 컴포넌트 | AnimatedSection + SectionHeader 재사용 | Home 신규 섹션 |
| 7 | HomePage에 섹션 삽입 | `import` 1줄 + JSX 1줄 | HomePage.tsx |
| 8 | About 섹션 순서/레이블 재구성 | AboutPage.tsx 섹션 재배열 | About 페이지 |

### Phase 3 — 내비게이션 리브랜딩 (1일)
> 문자열 변경 + Route 변경 + 리다이렉트

| # | 항목 | 방법 | 영향 범위 |
|---|------|------|----------|
| 9 | Header 내비게이션 레이블 변경 | Header.tsx / MegaMenu.tsx 텍스트 수정 | 전체 내비게이션 |
| 10 | `/blog` → `/stories` 라우트 변경 | App.tsx Route + vercel.json 301 리다이렉트 | Blog/Stories |
| 11 | `/archive` → `/history` 라우트 변경 | App.tsx Route + vercel.json 301 리다이렉트 | Archive/History |
| 12 | SeoHead 전 페이지 업데이트 | 각 Page.tsx SeoHead props 수정 | SEO 전체 |

### Phase 4 — Wedding 3-Track 재구성 (1~2일)
> 기존 탭 컴포넌트 재사용

| # | 항목 | 방법 | 영향 범위 |
|---|------|------|----------|
| 13 | Wedding 탭 레이블 변경 | WeddingPage.tsx GALLERY_TABS 수정 | Wedding 페이지 |
| 14 | Wedding Hero 카피 변경 | WeddingPage.tsx 또는 CMS | Wedding Hero |
| 15 | 3-Track 설명 텍스트 추가 | WeddingPage.tsx 정적 데이터 | Wedding 섹션 |

### Phase 5 — Stories 시리즈 구조 (1일)
> 카테고리 레이블 변경

| # | 항목 | 방법 | 영향 범위 |
|---|------|------|----------|
| 16 | Blog 카테고리 → Stories 시리즈 레이블 | BlogPage.tsx 카테고리 표시명 변경 | Stories 필터 |
| 17 | Stories 페이지 헤더 카피 변경 | BlogPage.tsx SeoHead + 헤더 | Stories 페이지 |

### Phase 6 — History Timeline 뷰 (2~3일)
> 가장 복잡도 높음, 후순위

| # | 항목 | 방법 | 영향 범위 |
|---|------|------|----------|
| 18 | Archive 카테고리 재설계 | ArchivePage.tsx CATEGORY_LABELS 수정 | History 필터 |
| 19 | Timeline 연도 구분자 추가 | ArchivePage.tsx 렌더링 로직 보강 | History 뷰 |

---

## 요약: 재사용 vs 신규

| 항목 | 재사용 | 신규 |
|------|--------|------|
| 컴포넌트 | AnimatedSection, SectionHeader, SeoHead, SectionCard, 탭 필터 전체 | `ExperienceJourneySection` 1개 |
| 데이터 | 기존 CMS 필드 재사용 (카피만 변경) | 없음 |
| 라우트 | 기존 페이지 구조 유지 | `/blog`→`/stories`, `/archive`→`/history` 리다이렉트 |
| 디자인 | 기존 컬러 시스템·타이포그래피 유지 | 없음 |

**결론:** 신규 컴포넌트 1개(`ExperienceJourneySection`) + CMS 데이터 재작성 + 카피/레이블 변경만으로
THE LIT를 '카페+스튜디오 대여 사이트'에서 '빛을 향해 걷는 브랜드 경험 공간'으로 전환할 수 있음.
