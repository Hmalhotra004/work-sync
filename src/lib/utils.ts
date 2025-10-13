import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import cloudinary from "./cloudinary";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInviteCode(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export const extractCloudinaryPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

export const deleteCloudinaryImage = async (
  imageUrl: string
): Promise<void> => {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};
