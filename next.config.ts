import { FOLDER_PROJECT, FOLDER_WORKSPACE, TOP_FOLDER } from "@/constants";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${TOP_FOLDER}/${FOLDER_WORKSPACE}/**`,
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${TOP_FOLDER}/${FOLDER_PROJECT}/**`,
      },
    ],
  },
};

export default nextConfig;
