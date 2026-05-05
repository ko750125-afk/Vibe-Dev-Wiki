# Supabase RLS 보안 설정 가이드

'Vibe Dev-Wiki'의 보안을 위해 아래 SQL 명령어를 Supabase SQL Editor에서 실행하십시오.

## 1. 테이블 권한 설정

현재 프로젝트 스키마(`vibe_admin_users`, `vibe_wiki_sectors`, `vibe_wiki_notes`) 기준으로  
모든 사용자는 읽기(SELECT)가 가능하고, `vibe_admin_users`에 등록된 이메일만 생성/수정/삭제가 가능하도록 설정합니다.

```sql
-- RLS 활성화
ALTER TABLE vibe_wiki_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_wiki_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_admin_users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Anyone can read sectors" ON vibe_wiki_sectors;
DROP POLICY IF EXISTS "Admins can manage sectors" ON vibe_wiki_sectors;
DROP POLICY IF EXISTS "Anyone can read notes" ON vibe_wiki_notes;
DROP POLICY IF EXISTS "Admins can manage notes" ON vibe_wiki_notes;
DROP POLICY IF EXISTS "Anyone can check admins" ON vibe_admin_users;

-- [Sectors 정책]
CREATE POLICY "Anyone can read sectors" ON vibe_wiki_sectors
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sectors" ON vibe_wiki_sectors
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM vibe_admin_users
      WHERE vibe_admin_users.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM vibe_admin_users
      WHERE vibe_admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- [Notes 정책]
CREATE POLICY "Anyone can read notes" ON vibe_wiki_notes
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage notes" ON vibe_wiki_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM vibe_admin_users
      WHERE vibe_admin_users.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM vibe_admin_users
      WHERE vibe_admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- [Admin 목록 조회 정책]
CREATE POLICY "Anyone can check admins" ON vibe_admin_users
  FOR SELECT TO authenticated
  USING (true);
```

## 2. 주의 사항
- 이 가이드는 `supabase_schema.sql`의 정책 구조와 동일하게 유지됩니다.
- 관리자 권한은 `.env` 값이 아니라 `vibe_admin_users` 테이블 데이터로 판정됩니다.
- Supabase 콘솔의 **Authentication > Providers**에서 Google 로그인을 활성화해야 합니다.
- `Client ID`와 `Client Secret`을 Google Cloud Console에서 발급받아 입력해야 합니다.
- Redirect URI는 `https://[PROJECT_REF].supabase.co/auth/v1/callback` 형태로 설정하십시오.
