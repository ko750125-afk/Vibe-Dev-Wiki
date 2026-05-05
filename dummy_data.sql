-- 더미 데이터 삽입 스크립트 (Vibe Dev-Wiki)
-- 모든 스테이지와 섹터 필터링을 테스트하기 위한 고품질 데이터셋입니다.

-- 기존 데이터 초기화 (필요시 주석 해제)
-- TRUNCATE vibe_wiki_notes;

INSERT INTO vibe_wiki_notes (sector_id, stage_name, title, content, block_type, tags)
VALUES
  -- 1. 기획 (id: 1)
  (1, 'Step 1', '프로젝트 비전 및 브랜딩 전략', '### Vibe Dev-Wiki의 가치\n단순한 문서화를 넘어, 개발의 리듬을 기록합니다.\n\n### 핵심 가치\n- **Aesthetic**: 프리미엄 UI/UX\n- **Efficiency**: 빠른 검색과 필터링\n- **Security**: 견고한 RLS 정책', 'tip', '{비전,기획,브랜딩}'),
  (1, 'Step 2', '사용자 경험(UX) 흐름 정의', '1. 랜딩 페이지 진입\n2. 섹터별 지식 탐색\n3. 상세 모달을 통한 심화 학습\n4. 전역 검색을 통한 빠른 접근', 'tip', '{UX,기획}'),

  -- 6. 디자인 (id: 6)
  (6, 'Step 1', '디자인 시스템: 컬러 & 타이포그래피', '### Color Palette\n- Primary: `#3B82F6` (Vivid Blue)\n- Background: `#000000` (Pure Black)\n- Surface: `#111111` (Deep Grey)\n\n### Typography\n- Headlines: `Outfit`\n- Body: `Inter`', 'config', '{디자인,스타일,System}'),
  (6, 'Step 2', '글래스모피즘(Glassmorphism) 구현 가이드', '사이드바와 모달에 `backdrop-blur-md`와 10% 투명도의 배경색을 적용하여 세련된 투명감을 연출합니다.', 'tip', '{UI,CSS,Glassmorphism}'),
  (6, 'Step 3', '애니메이션 및 마이크로 인터랙션', '카드 호버 시 `y-offset` 이동과 `scale` 변화를 통해 사용자 피드백을 강화합니다.', 'tip', '{애니메이션,UX}'),

  -- 2. 인프라 (id: 2)
  (2, 'Step 1', 'Supabase 초기 설정 및 스키마 설계', '`vibe_wiki_notes` 테이블 생성 및 인덱스 최적화 작업을 수행합니다.', 'config', '{Supabase,인프라,DB}'),
  (2, 'Step 3', 'RLS(Row Level Security) 보안 정책', '관리자 권한을 가진 사용자만 데이터를 수정할 수 있도록 정책을 설정합니다.', 'security', '{보안,RLS}'),

  -- 3. 개발 (id: 3) - 전체 스테이지 테스트용
  (3, 'Step 1', 'Next.js 15+ & Tailwind 환경 구축', '최신 App Router 구조와 PostCSS 설정을 완료합니다.', 'config', '{Nextjs,환경설정}'),
  (3, 'Step 2', 'Lucide-React 아이콘 시스템 통합', '직렬화 에러를 방지하기 위해 서버 컴포넌트에서는 ID만 전달하고 클라이언트에서 렌더링합니다.', 'command', '{React,Icon}'),
  (3, 'Step 3', '마크다운 파서 및 신택스 하이라이팅', '`react-markdown`과 `prismjs`를 연동하여 코드 블록을 시각화합니다.', 'tip', '{Markdown,개발}'),
  (3, 'Step 4', '전역 검색(Cmd+K) 및 단축키 바인딩', '`window.addEventListener`를 통한 키보드 인터럽트 처리 및 포커스 관리.', 'command', '{JavaScript,UX,Search}'),
  (3, 'Step 5', '반응형 그리드 레이아웃 최적화', '다양한 해상도에서 카드가 유연하게 배치되도록 `grid-cols`를 조정합니다.', 'tip', '{CSS,Responsive}'),

  -- 7. 보안 (id: 7)
  (7, 'Step 1', 'API Key 및 환경 변수 관리 보안', '클라이언트 측에 노출되면 안 되는 키는 반드시 서버 사이드(env)에서 처리합니다.', 'security', '{인증,보안}'),

  -- 5. 배포 (id: 5)
  (5, 'Step 2', 'Vercel 빌드 최적화 및 배포', 'GitHub 연동을 통한 자동 배포 및 캐시 무효화 전략 수립.', 'config', '{배포,Vercel}');
