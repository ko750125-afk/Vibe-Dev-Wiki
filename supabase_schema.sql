-- 1. 'vibe_admin_users' 테이블 생성 (관리자 명단 관리)
CREATE TABLE IF NOT EXISTS vibe_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 'vibe_wiki_sectors' 테이블 생성 (기술 스택 소분류)
CREATE TABLE IF NOT EXISTS vibe_wiki_sectors (
  id SERIAL PRIMARY KEY,
  category_id INT4 NOT NULL, -- 1: Client, 2: Server, 3: DB, 4: Others
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 'vibe_wiki_notes' 테이블 생성
CREATE TABLE IF NOT EXISTS vibe_wiki_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id INT4 NOT NULL, -- vibe_wiki_sectors.id 참조
  stage_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  block_type TEXT NOT NULL, -- security, config, command, tip
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS (Row Level Security) 활성화
ALTER TABLE vibe_wiki_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_wiki_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_admin_users ENABLE ROW LEVEL SECURITY;

-- 5. 정책 설정
DROP POLICY IF EXISTS "Anyone can read sectors" ON vibe_wiki_sectors;
DROP POLICY IF EXISTS "Admins can manage sectors" ON vibe_wiki_sectors;
DROP POLICY IF EXISTS "Anyone can read notes" ON vibe_wiki_notes;
DROP POLICY IF EXISTS "Admins can manage notes" ON vibe_wiki_notes;
DROP POLICY IF EXISTS "Anyone can check admins" ON vibe_admin_users;

-- [Sectors 정책]
CREATE POLICY "Anyone can read sectors" ON vibe_wiki_sectors FOR SELECT USING (true);
CREATE POLICY "Admins can manage sectors" ON vibe_wiki_sectors FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM vibe_admin_users WHERE vibe_admin_users.email = auth.jwt() ->> 'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM vibe_admin_users WHERE vibe_admin_users.email = auth.jwt() ->> 'email'));

-- [Notes 정책]
CREATE POLICY "Anyone can read notes" ON vibe_wiki_notes FOR SELECT USING (true);
CREATE POLICY "Admins can manage notes" ON vibe_wiki_notes FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM vibe_admin_users WHERE vibe_admin_users.email = auth.jwt() ->> 'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM vibe_admin_users WHERE vibe_admin_users.email = auth.jwt() ->> 'email'));

-- [Admin 정책]
CREATE POLICY "Anyone can check admins" ON vibe_admin_users FOR SELECT TO authenticated USING (true);

-- 6. 초기 데이터 삽입 (Sectors)
INSERT INTO vibe_wiki_sectors (category_id, name) VALUES 
-- Client Side
(1, 'Javascript'), (1, 'Next.js'), (1, 'React'), (1, 'Tailwind CSS'), (1, 'Shadcn'),
-- Server Side
(2, 'Node.js'), (2, 'FastAPI'), (2, 'REST API'), (2, 'Supabase Auth'), (2, '구글 로그인(OAuth)'), (2, '환경변수 관리(.env)'), (2, 'API Key'),
-- DataBase
(3, 'Supabase (PostgreSQL)'), (3, 'MySQL'), (3, 'Firebase(Realtime Database)'), (3, 'MongoDB'), (3, 'Supabase Storage'), (3, 'Firebase Storage'), (3, 'ORM (DB관리)'), (3, 'Prisma'),
-- Others
(4, 'Vercel'), (4, 'GitHub'), (4, 'MCP'), (4, 'gitignore')
ON CONFLICT DO NOTHING;

