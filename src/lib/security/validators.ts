import { z } from "zod";

const uuidSchema = z.uuid();

/**
 * [ALTA-4] Verifica que un string sea un UUID v4/v7 válido antes de consultarlo en BD.
 */
export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && uuidSchema.safeParse(value).success;
}

/**
 * [MEDIA-2] Filtra y sanitiza las URLs de imágenes de solicitudes para asegurar
 * que pertenezcan exclusivamente al bucket `request-images` del proyecto.
 */
export function sanitizeRequestImageUrls(rawUrls: FormDataEntryValue[]): string[] {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const publicPrefix = `${baseUrl}/storage/v1/object/public/request-images/`;
  const authPrefix = `${baseUrl}/storage/v1/object/authenticated/request-images/`;

  return rawUrls
    .map(String)
    .map((u) => u.trim())
    .filter((url) => {
      if (!url) return false;
      return (
        (baseUrl && (url.startsWith(publicPrefix) || url.startsWith(authPrefix))) ||
        /^[0-9a-f-]{36}\/[0-9a-f0-9_-]+\.(jpg|jpeg|png|webp|gif)$/i.test(url)
      );
    })
    .slice(0, 4);
}

/**
 * [MEDIA-3] Inspecciona los primeros 12 bytes reales del archivo (Magic Bytes)
 * para impedir que se suban archivos HTML/SVG/scripts disfrazados de imágenes.
 */
export async function hasValidImageMagicBytes(file: File): Promise<boolean> {
  if (file.size < 12) return false;
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true;
  }
  // GIF: "GIF8" (47 49 46 38)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return true;
  }
  // WEBP: "RIFF" en 0..3 y "WEBP" en 8..11
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

