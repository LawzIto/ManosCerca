"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MAX_FILES = 4;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface UploadedImage {
  url: string;
  previewUrl: string;
}

interface Props {
  /** Nombre del campo hidden que se enviará con el form (puede repetirse). */
  fieldName?: string;
  onChange?: (urls: string[]) => void;
}

export function ImageUploader({ fieldName = "imageUrl", onChange }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("request-images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("request-images").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);

      const remaining = MAX_FILES - images.length;
      if (remaining <= 0) {
        setError(`Solo puedes subir hasta ${MAX_FILES} imágenes.`);
        return;
      }

      const toUpload = Array.from(files).slice(0, remaining);
      const oversized = toUpload.filter((f) => f.size > MAX_SIZE_BYTES);
      if (oversized.length > 0) {
        setError("Cada imagen debe pesar menos de 10 MB.");
        return;
      }
      const wrongType = toUpload.filter((f) => !ACCEPTED.includes(f.type));
      if (wrongType.length > 0) {
        setError("Solo se admiten imágenes JPG, PNG, WebP o GIF.");
        return;
      }

      setUploading(true);
      try {
        const uploaded = await Promise.all(
          toUpload.map(async (file) => {
            const previewUrl = URL.createObjectURL(file);
            const url = await uploadFile(file);
            return { url, previewUrl };
          }),
        );
        const next = [...images, ...uploaded];
        setImages(next);
        onChange?.(next.map((img) => img.url));
      } catch (err) {
        console.error("ImageUploader upload error:", err);
        setError("No se pudo subir una o más imágenes. Intenta de nuevo.");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [images, onChange, uploadFile],
  );

  const removeImage = useCallback(
    (index: number) => {
      const next = images.filter((_, i) => i !== index);
      setImages(next);
      onChange?.(next.map((img) => img.url));
    },
    [images, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const canAdd = images.length < MAX_FILES && !uploading;

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden inputs para el FormData */}
      {images.map((img) => (
        <input key={img.url} type="hidden" name={fieldName} value={img.url} />
      ))}

      {/* Zona de drop / botón */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Subir imágenes del problema"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
          )}
          <span>
            {uploading
              ? "Subiendo…"
              : "Haz clic o arrastra imágenes aquí"}
          </span>
          <span className="text-xs">JPG, PNG, WebP o GIF · máx. 10 MB · hasta {MAX_FILES} fotos</span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="sr-only"
            aria-hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Previews */}
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Imágenes seleccionadas">
          {images.map((img, i) => (
            <li key={img.url} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image
                src={img.previewUrl}
                alt={`Imagen ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 size-6 rounded-full p-0"
                onClick={() => removeImage(i)}
                aria-label={`Eliminar imagen ${i + 1}`}
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

