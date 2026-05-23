import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // 초고해상도 인포그래픽 Base64 인라인 페이로드 완벽 수용
    },
  },
};

export default nextConfig;
