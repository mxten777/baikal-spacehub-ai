# BAIKAL Admin Framework v1.0

**Status** : Released  
**Version** : v1.0.0  
**State** : Frozen  
**Base Project** : THE LIT  
**Release Date** : 2026-08-01

---

## 개요

THE LIT 관리자 화면에 BAIKAL Admin Framework를 적용한 표준화 작업의 결과물이다.  
Phase 1 (메뉴 분리, 기본 구조)과 Phase 2 (Media, Content Editor, Dashboard 표준화)로 구성된다.

---

## Phase 2 변경 이력

### Dashboard Framework

- 4-블록 구조 확정: 오늘 할 일 / 주요 현황 / 빠른 작업 / 최근 활동
- Quick Actions 링크 버그 수정 (`/admin/programs/new` 등 미존재 라우트 → 목록 페이지로 수정)
- Pending Content 카드 super_admin 전용 표시
- `/admin/external-content` → `/admin/external` 통합 라우트로 변경

### Dashboard My Work (오늘 할 일)

- 신규 문의 건수 + 링크 (`useInquiries({ status: 'pending' })` 재사용)
- 신규 예약 건수 + 링크 (`reservationsService.getAll({ status: 'new' })` 직접 useQuery)
- 승인 대기 콘텐츠 (super_admin, 건수 > 0일 때만 표시)
- 최근 오류 항목 (데이터 없음, 숨김)

### Dashboard Statistics (주요 현황)

- 섹션 헤딩 추가
- 예약 신규 카드 추가

### Role Framework

- operator / super_admin 메뉴 분리 확정
- RoleGuard 적용 완료

### Menu Naming

- "이미지 자산 관리" → "촬영 프로젝트 관리"
- "AI 사진 큐레이터" → "사진 큐레이터"

### Media Framework

- 역할 분리 확정
  - `AdminMediaPage`: 수동 SNS 링크 등록 (`media_items`)
  - `AdminExternalContentPage`: 자동 수집 콘텐츠 검토 (`external_contents`)
  - `AdminPhotoProjectsPage` + `AdminPhotoAssetExplorerPage`: 프로젝트 기반 사진 자산
  - `AdminPhotoCuratorPage`: 프로젝트 비종속 자유 업로드 + AI 준비 중

### Upload Validation 표준화

- `photoStorage.ts`를 업로드 검증 기준의 단일 기준점으로 확정
- Export: `ALLOWED_TYPES`, `MAX_SIZE_MB`, `MAX_SIZE_BYTES`, `getExtension`
- `ImageUploadField.tsx`, `AdminPhotoCuratorPage.tsx` 임포트 통일

### Content Editor Standard

- 저장 실패 피드백 통일: Programs, Blog, Hero에 `submitError` 인라인 표시 추가
- 업로드 중 저장 차단
  - `AdminProgramsPage`: `uploadingImage` boolean
  - `AdminHeroPage`: `uploadingDesktopImage`, `uploadingMobileImage` 각각 관리
  - `AdminSpacesPage`: `uploadingCount` 카운터 (cover + gallery N개 공유)
  - `AdminArchivePage`, `AdminBlogPage`: 기존 구현 유지

### Storage Cleanup 표준화

- 모든 CMS 편집 화면 Storage 정리 패턴 통일
  - 임시 업로드 정리: 폼 취소 시 `uploadedUrlsRef` → `deleteStorageFilesByUrls`
  - 이미지 교체 정리: 저장 성공 후 이전 URL과 비교, 교체된 파일 삭제
  - 삭제 실패 시 amber 경고 배너 (`storageWarning` 상태)
- 누락 화면 추가 적용: `AdminArchivePage`, `AdminAboutPage`
- `lib/storage.ts`의 `SAFE_PATH_PREFIX = 'cms/'` 가드 유지 (비 CMS 경로 실수 삭제 방지)

### Photo Asset Explorer

- 에러 화면 분기 처리: 네트워크 오류(`isError`) vs 미존재 프로젝트(`!project`) 메시지 구분

### Wedding Integration

- 사진 영역: `photos` 테이블 wedding 카테고리 읽기 전용
- 문의 영역: `inquiries` 테이블 `inquiry_type = 'wedding'` 통합 화면

### External Content

- super_admin 전용 범위 확정
- `/admin/external` 탭 래퍼 (콘텐츠 소스 + 외부 콘텐츠) 단일 진입점

---

## 구조 요약

### Storage 버킷 구조 (`photos` 버킷)

| 경로 패턴                                       | 용도              | 관리 화면                   |
| ----------------------------------------------- | ----------------- | --------------------------- |
| `cms/{folder}/{uuid}.ext`                       | CMS 콘텐츠 이미지 | ImageUploadField            |
| `photo-curator/{userId}/{YYYY}/{MM}/{uuid}.ext` | 자유 업로드       | AdminPhotoCuratorPage       |
| `{projectSlug}/{category}/{stage}/{uuid}.ext`   | 프로젝트 자산     | AdminPhotoAssetExplorerPage |

### 관리자 권한 구조

| 권한                                        | operator | super_admin |
| ------------------------------------------- | -------- | ----------- |
| 콘텐츠 관리 (공간/프로그램/아카이브/블로그) | ✅       | ✅          |
| 웨딩·문의·예약                              | ✅       | ✅          |
| 미디어·사진 큐레이터                        | ✅       | ✅          |
| 사이트 구성 (Hero/About)                    | ❌       | ✅          |
| 촬영 프로젝트 관리                          | ❌       | ✅          |
| 외부 콘텐츠 관리                            | ❌       | ✅          |
| 사용자·시스템 관리                          | ❌       | ✅          |

---

## Git Tag

```
v1.0.0-admin-framework
```

## Commit Message

```
release(admin-framework): freeze BAIKAL Admin Framework v1.0 Phase 2

- Media Framework: upload validation standardized (photoStorage.ts single source)
- Content Editor: save error feedback, upload-during-save guard, storage cleanup
- Role Framework: operator/super_admin menu separation finalized
- Dashboard: 4-block structure, My Work section, reservation card, link fixes
- Asset Explorer: error state split (network error vs not found)
- Wedding Integration: photo read-only + inquiry management unified
- External Content: super_admin scope enforced, admin/external route consolidated
- Storage Cleanup: Archive and About pages added, all CMS editors covered
- Menu Naming: 촬영 프로젝트 관리, 사진 큐레이터 standardized
```

---

## 이후 관리

다음부터는 이 파일을 직접 수정하지 않는다.  
개선사항은 `CHANGELOG_v1.1.md`에 누적한다.

---

Framework v1.0은 기준 버전으로 확정되었으며,  
이후 개선사항은 v1.1에서 관리한다.
