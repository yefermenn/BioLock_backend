BEGIN;

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS notif_push BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_intrusos BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_denegados BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  plataforma VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS push_tokens_usuario_token_key ON public.push_tokens(usuario_id, token);

CREATE TABLE IF NOT EXISTS public.evidencias_intrusos (
  id SERIAL PRIMARY KEY,
  dispositivo_id INTEGER NOT NULL REFERENCES public.dispositivos(id) ON DELETE CASCADE,
  intento_id BIGINT NULL REFERENCES public.intentos_fallidos(id) ON DELETE SET NULL,
  alarma_id INTEGER NULL REFERENCES public.alarmas(id) ON DELETE CASCADE,
  id_local VARCHAR(255) NOT NULL,
  ruta_archivo TEXT NOT NULL,
  mime_tipo VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
  creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_en TIMESTAMPTZ NOT NULL,
  expirada BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX IF NOT EXISTS evidencias_intrusos_alarma_key ON public.evidencias_intrusos(alarma_id);
CREATE INDEX IF NOT EXISTS evidencias_intrusos_expira_idx ON public.evidencias_intrusos(expira_en);

COMMIT;
