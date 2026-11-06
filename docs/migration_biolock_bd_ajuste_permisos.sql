-- ------------------------------------------------------------
-- BioLock_BD: comparación vs entidades del proyecto
-- Fecha: 2026-11-05
-- Objetivo: dejar la BD alineada con el backend actual.
-- IMPORTANTE: ESTE SCRIPT NO SE EJECUTÓ EN ESTA SESIÓN.
-- ------------------------------------------------------------

BEGIN;

-- La comparación contra las entidades del proyecto muestra que las tablas
-- principales de usuarios, biometría, alarmas y horarios ya incluyen la
-- mayoría de columnas esperadas.
--
-- El drift real que se detectó en la base de producción es que falta el
-- permiso del token nuevo usado por la ruta de regeneración del dispositivo.
--
-- Si el permiso ya existe, el INSERT no hace nada gracias a la constraint
-- UNIQUE sobre codigo.
INSERT INTO public.permisos (codigo, descripcion, modulo)
VALUES (
  'regenerar_token_dispositivo',
  'Regenerar token del dispositivo',
  'dispositivos'
)
ON CONFLICT (codigo) DO NOTHING;

-- Si en tu entorno quieres dejarlo disponible también para un rol concreto,
-- descomenta la sección siguiente y ajusta el rol deseado.
--
-- INSERT INTO public.roles_permisos (rol_id, permiso_id, otorgado_en)
-- SELECT r.id, p.id, NOW()
-- FROM public.roles r
-- JOIN public.permisos p ON p.codigo = 'regenerar_token_dispositivo'
-- WHERE r.nombre = 'superadmin'
-- ON CONFLICT DO NOTHING;

COMMIT;
