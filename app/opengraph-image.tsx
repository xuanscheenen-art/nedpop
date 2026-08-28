import {
  createNedPopOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";

export const alt = "NedPop 内德泡泡：先搞懂，再记住";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpenGraphImage() {
  return createNedPopOgImage();
}
