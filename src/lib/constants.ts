import { Layout, HardDrive, Code2, Box, Send, Palette, ShieldCheck, Zap } from 'lucide-react'

export const SECTORS = [
  { id: 1, name: '기획', icon: Layout, description: '아이디어 및 요구사항 정의' },
  { id: 6, name: '디자인', icon: Palette, description: 'UI/UX 및 브랜드 가이드' },
  { id: 2, name: '인프라', icon: HardDrive, description: '서버 및 데이터베이스 설정' },
  { id: 3, name: '개발', icon: Code2, description: '핵심 기능 및 비즈니스 로직' },
  { id: 7, name: '보안', icon: ShieldCheck, description: '취약점 관리 및 보안 정책' },
  { id: 4, name: '창고', icon: Box, description: '유틸리티 및 재사용 가능 코드' },
  { id: 5, name: '배포', icon: Send, description: 'Vercel 및 프로덕션 환경' },
  { id: 8, name: '성능', icon: Zap, description: '최적화 및 로드 밸런싱' },
] as const

export type SectorId = typeof SECTORS[number]['id']
