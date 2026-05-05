# Vibe Dev-Wiki 운영 가이드

Next.js(App Router) + Supabase 기반의 개발 위키 서비스입니다.  
이 문서는 실제 현재 코드 기준으로 운영에 필요한 설정/흐름/절차를 정리합니다.

## 1) 환경변수

필수 환경변수는 아래 2개입니다.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

- 사용 위치:
  - `src/utils/supabase/client.ts`
  - `src/utils/supabase/server.ts`
  - `src/utils/supabase/middleware.ts`

로컬 실행 전 `.env.local`에 값을 설정하세요.

## 2) 인증 흐름 (Google OAuth)

현재 인증 흐름은 아래와 같습니다.

1. 사용자가 `/login`에서 `Google로 계속하기` 클릭
2. `src/app/login/actions.ts`의 `signInWithGoogle()` 실행
3. Supabase OAuth로 이동 후 인증 완료
4. 콜백 `src/app/auth/callback/route.ts`에서 `exchangeCodeForSession(code)` 실행
5. 세션 생성 후 `/`로 리다이렉트
6. 로그아웃은 `/auth/signout` POST로 처리

운영 체크:
- Supabase `Authentication > Providers`에서 Google 활성화
- Google Cloud OAuth 설정에 Supabase 콜백 URI 등록

## 3) DB 초기화

DB 스키마/정책 기준 파일:
- `supabase_schema.sql`

초기화 절차:
1. Supabase SQL Editor 열기
2. `supabase_schema.sql` 전체 실행
3. 아래 테이블/정책 생성 여부 확인
   - `vibe_admin_users`
   - `vibe_wiki_sectors`
   - `vibe_wiki_notes`
   - 각 테이블 RLS 정책

참고:
- 앱은 관리자 판정 시 `vibe_admin_users`를 조회합니다.
- 테이블이 아직 없는 경우 앱은 안전하게 `isAdmin: false`로 동작하도록 폴백 처리되어 있습니다.

## 4) 권한 운영 절차

권한 모델은 **DB 기반 단일 기준**입니다.

- 관리자 판정 기준:
  - `src/lib/auth.ts`에서 로그인 사용자 이메일이 `vibe_admin_users.email`에 존재하면 관리자
- 앱/서버/UI가 같은 기준 사용:
  - UI의 관리자 기능 노출 여부
  - Server Action 쓰기 권한
  - Supabase RLS 정책

### 관리자 등록 절차

운영자가 SQL Editor에서 관리자 이메일을 등록합니다.

```sql
INSERT INTO vibe_admin_users (email)
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;
```

### 관리자 해제 절차

```sql
DELETE FROM vibe_admin_users
WHERE email = 'admin@example.com';
```

### 운영 점검 체크리스트

- 관리자 계정 로그인 시:
  - 섹터/노트 생성, 수정, 삭제 가능
  - 관리자 UI 노출
- 일반 계정 로그인 시:
  - 읽기만 가능
  - 관리자 UI 비노출
- 정책 오류 발생 시:
  - `supabase_schema.sql` 재적용 후 정책/테이블 재확인
