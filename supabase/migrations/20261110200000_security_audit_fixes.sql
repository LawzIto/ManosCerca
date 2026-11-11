-- ============================================================================
-- 1. [CRÍTICA-2] Privatizar bucket request-images y restringir lectura
-- ============================================================================
UPDATE storage.buckets
SET public = false
WHERE id = 'request-images';

DROP POLICY IF EXISTS "request-images: lectura pública" ON storage.objects;
DROP POLICY IF EXISTS "request-images: lectura para participantes" ON storage.objects;

CREATE POLICY "request-images: lectura para participantes"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'request-images'
    AND (
      -- El propietario de las imágenes (cliente: <uid>/<archivo>)
      (storage.foldername(name))[1] = auth.uid()::text
      -- O profesionales autenticados (acceden vía Signed URLs generadas en el servidor)
      OR public.current_role_is('professional')
    )
  );

-- ============================================================================
-- 2. [ALTA-1] Restringir lectura GPS a servicios activos y limpiar al finalizar
-- ============================================================================
DROP POLICY IF EXISTS "tracking: el cliente lee la posición" ON public.tracking_locations;
DROP POLICY IF EXISTS "tracking: el cliente lee la posición durante servicio activo" ON public.tracking_locations;

CREATE POLICY "tracking: el cliente lee la posición durante servicio activo"
  ON public.tracking_locations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests r
      WHERE r.id = request_id
        AND r.client_id = auth.uid()
        AND r.status IN ('aceptado', 'en_progreso')
    )
  );

CREATE OR REPLACE FUNCTION public.cleanup_tracking_on_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF new.status IN ('completado', 'cancelado') AND old.status NOT IN ('completado', 'cancelado') THEN
    DELETE FROM public.tracking_locations WHERE request_id = new.id;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS service_requests_cleanup_tracking ON public.service_requests;
CREATE TRIGGER service_requests_cleanup_tracking
  AFTER UPDATE OF status ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_tracking_on_complete();

-- ============================================================================
-- 3. [ALTA-2] Defensa en profundidad para aislamiento de propuestas
-- ============================================================================
DROP POLICY IF EXISTS "proposals: el profesional ve las suyas y el cliente las de su solicitud" ON public.proposals;
DROP POLICY IF EXISTS "proposals: lectura contextual" ON public.proposals;

CREATE POLICY "proposals: lectura contextual"
  ON public.proposals FOR SELECT TO authenticated
  USING (
    professional_id = auth.uid()
    OR (
      EXISTS (
        SELECT 1 FROM public.service_requests r
        WHERE r.id = request_id AND r.client_id = auth.uid()
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.service_requests r
        WHERE r.id = request_id AND r.professional_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 4. [MEDIA-5] Evitar cotizaciones huérfanas por Race Condition
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reject_orphan_proposals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF new.status <> 'pendiente' AND old.status = 'pendiente' THEN
    UPDATE public.proposals
    SET status = 'rechazada'
    WHERE request_id = new.id
      AND status = 'pendiente';
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS zzz_service_requests_reject_orphans ON public.service_requests;
CREATE TRIGGER zzz_service_requests_reject_orphans
  AFTER UPDATE OF status ON public.service_requests
  FOR EACH ROW
  WHEN (old.status = 'pendiente' AND new.status <> 'pendiente')
  EXECUTE FUNCTION public.reject_orphan_proposals();

