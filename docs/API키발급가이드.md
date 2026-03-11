# 플랫폼별 API 키 발급 가이드

> The Lit 콘텐츠 자동 수집 시스템 — 외부 API 연동 설정 가이드  
> 최종 수정: 2026년 3월 11일

---

## 목차

1. [YouTube Data API v3](#1-youtube-data-api-v3)
2. [Instagram Graph API](#2-instagram-graph-api)
3. [X (Twitter) API v2](#3-x-twitter-api-v2)
4. [RSS (API 키 불필요)](#4-rss-api-키-불필요)
5. [API 키 등록 방법](#5-api-키-등록-방법)
6. [수집 우선순위 및 제한 사항](#6-수집-우선순위-및-제한-사항)

---

## 1. YouTube Data API v3

### 발급 소요 시간
약 10분

### 비용
무료 (일 10,000 units 할당. 1채널 1시간 수집 ≈ 24 units 소비로 무료 운영 가능)

### 발급 절차

**Step 1. Google Cloud Console 접속**
- [https://console.cloud.google.com](https://console.cloud.google.com) 접속
- Google 계정으로 로그인

**Step 2. 프로젝트 생성**
- 상단 프로젝트 드롭다운 → **"새 프로젝트"** 클릭
- 프로젝트 이름 입력 (예: `thelit-website`) → **"만들기"**

**Step 3. YouTube Data API 활성화**
- 좌측 메뉴 → **"API 및 서비스"** → **"라이브러리"**
- 검색창에 `YouTube Data API v3` 입력
- 검색 결과 클릭 → **"사용 설정"** 버튼 클릭

**Step 4. API 키 생성**
- 좌측 메뉴 → **"API 및 서비스"** → **"사용자 인증 정보"**
- **"+ 사용자 인증 정보 만들기"** → **"API 키"** 선택
- 생성된 키 복사 (예: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

**Step 5. API 키 보안 설정 (권장)**
- 생성된 키 옆 연필 아이콘(수정) 클릭
- **"API 제한"** → "키 제한" 선택 → `YouTube Data API v3`만 체크
- **"애플리케이션 제한"** → "HTTP 리퍼러(웹사이트)" 선택
- 허용 URL 추가:
  ```
  https://thelit.kr/*
  https://*.vercel.app/*
  ```
- **"저장"** 클릭

### 채널 ID 확인 방법

수집할 YouTube 채널의 Channel ID를 찾아야 합니다.

**방법 1 (채널 URL에서 직접 확인)**
- 채널 URL이 `https://www.youtube.com/channel/UCxxxxxxxx` 형식이면 `UCxxxxxxxx` 부분이 채널 ID

**방법 2 (채널명(@) URL인 경우)**
1. YouTube 채널 페이지 접속
2. 마우스 우클릭 → **"페이지 소스 보기"**
3. `Ctrl+F` → `"channelId"` 검색
4. `"channelId":"UC` 로 시작하는 24자리 값 복사

**방법 3 (온라인 도구 사용)**
- [https://commentpicker.com/youtube-channel-id.php](https://commentpicker.com/youtube-channel-id.php) 접속
- 채널 URL 입력 → Channel ID 확인

### 등록할 값
```
Key:   youtube_api_key
Value: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 2. Instagram Graph API

### 발급 소요 시간
약 30~60분

### 비용
무료

### 전제 조건
- **Instagram 비즈니스 계정** 또는 **크리에이터 계정** 필요
  - 일반 개인 계정은 불가
  - Instagram 앱 → 설정 → 계정 → "전문가 계정으로 전환"
- **Facebook 페이지** 필요 (Instagram 비즈니스 계정과 연결)

### 발급 절차

**Step 1. Meta for Developers 접속**
- [https://developers.facebook.com](https://developers.facebook.com) 접속
- Facebook 계정으로 로그인

**Step 2. 개발자 계정 등록 (최초 1회)**
- 우측 상단 **"시작하기"** 또는 **"개발자 등록"**
- 약관 동의 후 개발자 계정 활성화

**Step 3. 앱 생성**
- [https://developers.facebook.com/apps](https://developers.facebook.com/apps) → **"앱 만들기"**
- 앱 유형: **"비즈니스"** 선택 → **"다음"**
- 앱 이름 입력 (예: `thelit-content-aggregator`)
- 비즈니스 계정 연결 (없으면 건너뜀) → **"앱 만들기"**

**Step 4. Instagram Graph API 제품 추가**
- 앱 대시보드 → **"제품 추가"** 섹션 찾기
- **"Instagram"** → **"설정"** 클릭

**Step 5. 단기 액세스 토큰 생성**
- 좌측 메뉴 → **"도구"** → **"그래프 API 탐색기"**
  또는 [https://developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer) 직접 접속
- 우측 상단 **"Meta 앱"** 드롭다운 → 방금 만든 앱 선택
- **"사용자 또는 페이지"** 드롭다운 → **"사용자 액세스 토큰 받기"**
- 권한 선택 (아래 3개 체크):
  - `instagram_basic`
  - `pages_show_list`
  - `pages_read_engagement`
- **"액세스 토큰 생성"** → Facebook 로그인 팝업 → 허용
- 생성된 단기 토큰 복사 (유효기간 1시간)

**Step 6. 장기 액세스 토큰으로 교환 (60일짜리)**

앱 ID와 앱 시크릿 확인:
- 앱 대시보드 → **"설정"** → **"기본 설정"**
- **앱 ID** 와 **앱 시크릿** 복사

브라우저 주소창에 아래 URL 입력 (괄호 내용을 실제 값으로 교체):

```
https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={앱_ID}&client_secret={앱_시크릿}&fb_exchange_token={단기_액세스_토큰}
```

응답 JSON에서 `access_token` 값 복사 → 이것이 **60일짜리 장기 토큰**입니다.

**Step 7. Instagram 사용자 ID 확인**

브라우저 주소창에 입력:
```
https://graph.facebook.com/v18.0/me/accounts?access_token={장기_토큰}
```

또는 그래프 API 탐색기에서:
```
GET /me?fields=id,name
```

반환된 `id` 값을 메모해 두세요. (수집 시 사용자 ID로 활용)

### 토큰 갱신 (60일마다 필요)

토큰 만료 전에 아래 URL로 갱신:
```
https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={앱_ID}&client_secret={앱_시크릿}&fb_exchange_token={현재_장기_토큰}
```

> **팁**: 매달 1일에 갱신 루틴을 만들면 잊지 않습니다.  
> Phase 4에서 Supabase Edge Function으로 자동 갱신 예정.

### 등록할 값
```
Key:   instagram_access_token
Value: IGQV... (장기 토큰 전체)
```

---

## 3. X (Twitter) API v2

### 발급 소요 시간
신청 후 승인까지 **1~3일** 소요 (자동 승인인 경우 즉시)

### 비용
Free 티어: 월 500,000 트윗 읽기 무료 (소규모 운영 충분)

### 주의 사항
> **CORS 미지원**: X API v2는 브라우저에서 직접 호출 불가.  
> 현재 구현은 브라우저 기반이므로 X 수집은 **Supabase Edge Function** 구현 후 사용 가능.  
> Phase 4 작업 항목으로 분류됨.

### 발급 절차

**Step 1. X 개발자 포털 접속**
- [https://developer.x.com](https://developer.x.com) 접속
- X 계정으로 로그인

**Step 2. 개발자 계정 신청**
- **"Sign up for Free Account"** 클릭
- 사용 목적 작성 (영어 권장, 최소 250자):
  ```
  We are operating a cultural space called "The Lit" in Seoul, Korea.
  We want to aggregate our own brand's tweets to display on our official website
  for visitors to see our latest updates. We will only read our own timeline
  using the read-only API and display the content on our website.
  ```
- 약관 동의 → 제출

**Step 3. 앱 생성**
- 승인 이메일 수신 후 → 개발자 포털 로그인
- **"Projects & Apps"** → **"New Project"**
- 프로젝트 이름 입력 (예: `thelit-website`) → 사용 목적 선택 → **"Next"**
- 앱 이름 입력 (예: `thelit-aggregator`) → **"Next"**

**Step 4. Bearer Token 복사**
- 앱 생성 완료 후 표시되는 토큰 화면에서 **"Bearer Token"** 복사
- ⚠️ 이 화면을 벗어나면 다시 볼 수 없으므로 반드시 저장

**Step 5. Bearer Token 재생성 (재발급 필요한 경우)**
- [https://developer.x.com/en/portal/dashboard](https://developer.x.com/en/portal/dashboard) 접속
- 앱 선택 → **"Keys and Tokens"** 탭
- **"Bearer Token"** → **"Regenerate"**

### X 사용자 ID 확인 방법

Bearer Token 발급 후 아래 API로 계정의 numeric ID 확인:
```
GET https://api.twitter.com/2/users/by/username/계정아이디
Authorization: Bearer {Bearer_Token}
```

(Edge Function 구현 시 자동으로 조회됩니다)

### 등록할 값
```
Key:   x_bearer_token
Value: AAAAAAAAAAAAAAAAAA... (Bearer Token 전체)
```

---

## 4. RSS (API 키 불필요)

RSS는 API 키 없이 URL만 등록하면 즉시 수집 가능합니다.

### 지원 형식
- RSS 2.0
- Atom 1.0
- Media RSS (이미지 포함)

### 플랫폼별 RSS URL 형식

| 플랫폼 | RSS URL 형식 | 예시 |
|--------|-------------|------|
| 네이버 블로그 | `https://rss.blog.naver.com/{아이디}` | `https://rss.blog.naver.com/thelit` |
| 티스토리 | `https://{블로그주소}/rss` | `https://thelit.tistory.com/rss` |
| 워드프레스 | `https://{사이트주소}/feed` | `https://thelit.kr/feed` |
| Brunch | `https://brunch.co.kr/api/v4.0/rss/@{아이디}` | `https://brunch.co.kr/api/v4.0/rss/@thelit` |
| 유튜브 채널 | `https://www.youtube.com/feeds/videos.xml?channel_id={채널ID}` | — |
| 일반 미디어 | 해당 사이트의 `/rss` 또는 `/feed` 경로 | — |

### RSS URL 확인 방법

수집하려는 블로그/미디어 사이트에서:
1. 브라우저 주소창에 `사이트주소/rss` 또는 `사이트주소/feed` 입력
2. XML 형식의 피드가 표시되면 해당 URL 사용
3. 또는 사이트 하단 RSS 아이콘(주황색) 링크 확인

### 등록할 값
콘텐츠 소스 등록 시 **RSS URL** 필드에 직접 입력 (별도 API 키 불필요)

---

## 5. API 키 등록 방법

### 방법 A — Supabase SQL Editor (권장)

Supabase 대시보드 → SQL Editor → 아래 쿼리 실행:

```sql
-- YouTube API 키 등록
UPDATE public.settings
SET value = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
WHERE key = 'youtube_api_key';

-- Instagram 장기 액세스 토큰 등록
UPDATE public.settings
SET value = 'IGQVxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
WHERE key = 'instagram_access_token';

-- X Bearer Token 등록
UPDATE public.settings
SET value = 'AAAAAAAAAAAAAAAAAAAAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
WHERE key = 'x_bearer_token';

-- 등록 확인
SELECT key, LEFT(value, 20) || '...' AS value_preview
FROM public.settings
WHERE key IN ('youtube_api_key', 'instagram_access_token', 'x_bearer_token');
```

### 방법 B — 관리자 Settings 페이지

사이트 `/admin/settings` 접속 → 해당 키 항목에 직접 입력

### 등록 후 확인

Supabase SQL Editor에서 설정값 확인:
```sql
SELECT key, 
       CASE WHEN length(value) > 0 
            THEN '✓ 등록됨 (' || length(value) || '자)' 
            ELSE '✗ 미등록' 
       END AS status
FROM public.settings
WHERE key IN (
  'youtube_api_key',
  'instagram_access_token', 
  'x_bearer_token',
  'rss_proxy_url'
);
```

---

## 6. 수집 우선순위 및 제한 사항

### 플랫폼별 작업 우선순위

| 순서 | 플랫폼 | 발급 시간 | 즉시 사용 | 비고 |
|------|--------|----------|----------|------|
| **1순위** | RSS | 0분 (불필요) | ✅ 즉시 | 브라우저 직접 수집 가능 |
| **2순위** | YouTube | 약 10분 | ✅ 즉시 | 브라우저 직접 수집 가능 |
| **3순위** | Instagram | 약 30~60분 | ✅ 즉시 | 비즈니스 계정 필요 |
| **4순위** | X | 1~3일 (심사) | ⚠️ Edge Function 필요 | CORS 미지원으로 서버 측 수집 필요 |

### API 할당량 요약

| 플랫폼 | 무료 한도 | 1시간 수집 소비량 | 일일 수집 가능 횟수 |
|--------|---------|----------------|------------------|
| YouTube | 10,000 units/일 | ~24 units | 약 416회 |
| Instagram | 200 calls/hour | ~1 call | 실질 무제한 |
| X | 500,000 reads/월 | ~50 reads | 충분 |
| RSS | 제한 없음 | — | 무제한 |

### 알려진 제한 사항 및 해결 방안

**YouTube**
- API 키가 브라우저에서 노출될 수 있음
- 해결책: Phase 4에서 Supabase Edge Function으로 이전

**Instagram**
- Long-lived Token은 60일마다 갱신 필요
- 해결책: Phase 4에서 Edge Function 자동 갱신 구현 예정
- 비즈니스/크리에이터 계정 전환 필수

**X (Twitter)**
- CORS 정책으로 브라우저에서 직접 API 호출 불가
- 해결책: Supabase Edge Function 구현 후 사용 가능 (Phase 4)
- 임시 해결책: 없음 (서버 측 호출 필수)

**RSS**
- allOrigins 프록시(`https://api.allorigins.win`) 사용 중
- 프록시 서버 불안정 시 수집 실패 가능
- 해결책: 자체 CORS 프록시 또는 Edge Function으로 이전

### 보안 주의사항

> ⚠️ API 키와 토큰은 절대 코드에 직접 하드코딩하지 마세요.  
> 현재 구조: Supabase `settings` 테이블에 저장 → 관리자만 접근 가능  
> 장기 목표: Supabase Edge Function의 환경 변수로 이전 (프론트엔드 완전 격리)

---

*The Lit 개발팀 · 2026년 3월 11일*
