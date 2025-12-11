import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  //  async rewrites() {
  //   return [
  //     {
  //        source: "/api/:path*",
  //       destination: "https://welcome-service-stg.metthier.ai:65000/api/v1/:path*",
  //     },
  //   ];
  // },
};



export default nextConfig;
