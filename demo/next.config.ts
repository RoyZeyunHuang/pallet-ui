import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @pallet/ui 以 TS 源码形式发布（不预编译），需要交给 Next 转译
  transpilePackages: ["@pallet/ui"],
};

export default nextConfig;
