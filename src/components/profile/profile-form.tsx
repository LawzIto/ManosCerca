"use client";

import { Camera } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/profile/user-avatar";
import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/lib/profile/actions";
import { AVATAR_TYPES, type ProfileFormState } from "@/lib/profile/schemas";

const AVATAR_SIZE = 512;

/** Recorta al centro y reduce la foto a 512×512 WebP antes de subirla (las del celular pesan varios MB). */
async function resizeAvatar(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(AVATAR_SIZE, side);
  canvas
    .getContext("2d")!
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("No se pudo procesar la imagen");
  return new File([blob], "avatar.webp", { type: "image/webp" });
}

type Defaults = { fullName: string; phone: string; bio: string; avatarUrl: string | null };

export function ProfileForm({ defaults, showBio }: { defaults: Defaults; showBio: boolean }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(updateProfile, {});
  const errors = state.fieldErrors;
  const values = state.values;

  const fileInput = useRef<HTMLInputElement>(null);
  // La vista previa pertenece al envío en curso: tras enviar, React limpia el input de archivo.
  const [selected, setSelected] = useState<{ url: string; state: ProfileFormState }>();
  const preview = selected?.state === state ? selected.url : undefined;
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state]);

  const selectedUrl = selected?.url;
  useEffect(
    () => () => {
      if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    },
    [selectedUrl],
  );

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const resized = await resizeAvatar(file);
      const transfer = new DataTransfer();
      transfer.items.add(resized);
      input.files = transfer.files;
      setSelected({ url: URL.createObjectURL(resized), state });
    } catch {
      // Formato que el navegador no decodifica (p. ej. HEIC): se envía el original y el servidor valida.
      setSelected(
        AVATAR_TYPES.includes(file.type) ? { url: URL.createObjectURL(file), state } : undefined,
      );
    } finally {
      setProcessing(false);
    }
  }

  const name = values?.fullName ?? defaults.fullName;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <div className="flex items-center gap-4">
        <UserAvatar name={name} url={preview ?? defaults.avatarUrl} className="size-20" fallbackClassName="text-2xl" />
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInput.current?.click()}
            disabled={processing}
          >
            <Camera aria-hidden />
            {processing ? "Procesando…" : preview || defaults.avatarUrl ? "Cambiar foto" : "Subir foto"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {preview ? "Guarda los cambios para actualizarla." : "JPG, PNG o WebP."}
          </p>
          <input
            ref={fileInput}
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
            tabIndex={-1}
            aria-label="Foto de perfil"
            aria-describedby="avatar-error"
          />
        </div>
      </div>
      <FieldError id="avatar-error" messages={errors?.avatar} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          defaultValue={name}
          aria-invalid={Boolean(errors?.fullName)}
          aria-describedby="fullName-error"
          className="h-10"
        />
        <FieldError id="fullName-error" messages={errors?.fullName} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          defaultValue={values?.phone ?? defaults.phone}
          aria-invalid={Boolean(errors?.phone)}
          aria-describedby="phone-error"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          Solo lo ve la otra parte mientras un servicio está activo.
        </p>
        <FieldError id="phone-error" messages={errors?.phone} />
      </div>

      {showBio && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">Sobre ti</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={500}
            placeholder="Opcional. Experiencia, zonas donde trabajas, horarios…"
            defaultValue={values?.bio ?? defaults.bio}
            aria-invalid={Boolean(errors?.bio)}
            aria-describedby="bio-error"
          />
          <FieldError id="bio-error" messages={errors?.bio} />
        </div>
      )}

      <Button type="submit" size="lg" className="h-11" disabled={pending || processing}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
