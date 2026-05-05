-- 1. 'vibe_admin_users' 테이블 생성 (관리자 명단 관리)
CREATE TABLE IF NOT EXISTS vibe_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 'vibe_wiki_notes' 테이블 생성 및 확장
CREATE TABLE IF NOT EXISTS vibe_wiki_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id INT4 NOT NULL,
  stage_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  block_type TEXT NOT NULL, -- security, config, command, tip
  tags TEXT[] DEFAULT '{}', -- 태그 시스템 추가
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 테이블이 있는 경우 tags 컬럼만 추가
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vibe_wiki_notes' AND column_name='tags') THEN
    ALTER TABLE vibe_wiki_notes ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE vibe_wiki_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_admin_users ENABLE ROW LEVEL SECURITY;

-- 4. 정책 설정 (기존 정책 삭제 후 재설정)
DROP POLICY IF EXISTS "Anyone can read notes" ON vibe_wiki_notes;
DROP POLICY IF EXISTS "Admins can manage notes" ON vibe_wiki_notes;
DROP POLICY IF EXISTS "Anyone can check admins" ON vibe_admin_users;

-- [Wiki 조회 정책] 누구나 읽을 수 있음
CREATE POLICY "Anyone can read notes" ON vibe_wiki_notes
  FOR SELECT USING (true);

-- [Wiki 관리 정책] vibe_admin_users 테이블에 등록된 사용자만 허용
CREATE POLICY "Admins can manage notes" ON vibe_wiki_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vibe_admin_users 
      WHERE vibe_admin_users.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vibe_admin_users 
      WHERE vibe_admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- [관리자 테이블 정책] 인증된 사용자는 관리자 목록 조회 가능 (권한 확인용)
CREATE POLICY "Anyone can check admins" ON vibe_admin_users
  FOR SELECT TO authenticated USING (true);
