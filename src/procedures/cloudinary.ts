import cloudinary from "@/lib/cloudinary";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

import {
  FOLDER_PROFILE,
  FOLDER_PROJECT,
  FOLDER_WORKSPACE,
  TOP_FOLDER,
} from "@/constants";

export const cloudinaryRouter = createTRPCRouter({
  getUploadSignature: protectedProcedure
    .input(
      z.object({
        folder: z.enum([FOLDER_WORKSPACE, FOLDER_PROJECT, FOLDER_PROFILE]),
      })
    )
    .mutation(async ({ input }) => {
      const timestamp = Math.round(Date.now() / 1000);

      const folder = `${TOP_FOLDER}/${input.folder}`;

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
        },
        process.env.CLOUDINARY_API_SECRET!
      );

      return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        timestamp,
        signature,
        folder,
      };
    }),
});
