import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "request-images";
const SIGNED_URL_EXPIRES_IN = 60 * 15; // 15 minutos

/**
 * Extrae el path interno del objeto dentro del bucket `request-images`
 * sin importar si fue almacenado como URL pública completa o como path relativo.
 */
function extractStoragePath(urlOrPath: string): string {
  const cleaned = urlOrPath.replace(
    /^.*\/storage\/v1\/object\/(?:public|authenticated|sign)\/request-images\//,
    ""
  );
  return cleaned.split("?")[0];
}

/**
 * Convierte un arreglo de rutas o URLs de `request-images` en Signed URLs temporales.
 */
export async function getSignedRequestImages(
  urls: string[] | null | undefined
): Promise<string[]> {
  if (!urls || urls.length === 0) return [];

  const supabase = await createClient();
  const paths = urls.map(extractStoragePath).filter(Boolean);
  if (paths.length === 0) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrls(paths, SIGNED_URL_EXPIRES_IN);

  if (error || !data) {
    console.error("getSignedRequestImages error:", error);
    return [];
  }

  return data
    .map((item) => item.signedUrl)
    .filter((url): url is string => Boolean(url));
}

