# Supabase RLS 보안 설정 가이드

'Vibe Dev-Wiki'의 보안을 위해 아래 SQL 명령어를 Supabase SQL Editor에서 실행하십시오.

## 1. 테이블 권한 설정

모든 사용자는 읽기(SELECT)가 가능하며, 지정된 관리자 이메일을 가진 사용자만 생성/수정/삭제가 가능하도록 설정합니다.

```sql
-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Allow public read access" ON wiki_notes;
DROP POLICY IF EXISTS "Allow admin to manage notes" ON wiki_notes;

-- 1. 모든 사용자에게 읽기 권한 부여
CREATE POLICY "Allow public read access" ON wiki_notes
  FOR SELECT USING (true);

-- 2. 관리자 이메일에게만 쓰기/수정/삭제 권한 부여
-- 'ko750125@gmail.com' 부분은 실제 .env.local의 NEXT_PUBLIC_ADMIN_EMAIL과 일치해야 합니다.
CREATE POLICY "Allow admin to manage notes" ON wiki_notes
  FOR ALL 
  USING (auth.jwt() ->> 'email' = 'ko750125@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ko750125@gmail.com');
```

## 2. 주의 사항
- Supabase 콘솔의 **Authentication > Providers**에서 Google 로그인을 활성화해야 합니다.
- `Client ID`와 `Client Secret`을 Google Cloud Console에서 발급받아 입력해야 합니다.
- Redirect URI는 `https://[PROJECT_REF].supabase.co/auth/v1/callback` 형태로 설정하십시오.
