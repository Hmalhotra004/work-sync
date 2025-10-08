export function isCloudinaryUrl(url: string | undefined): boolean {
  if (!url) return false;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  return url.startsWith(`https://res.cloudinary.com/${cloudName}/`);
}
