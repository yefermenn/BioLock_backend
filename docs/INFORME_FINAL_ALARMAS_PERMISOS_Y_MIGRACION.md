# Informe final: alarmas, permisos y migración de BD

## 1) Verificación de la estructura real de `BioLock_BD`

Se ejecutó la comprobación en lectura sobre la base remota y el resultado fue este:

### `alarmas`

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'alarmas'
ORDER BY ordinal_position;
```

Resultado:

```text
  column_name   |        data_type         
----------------+--------------------------
 id             | integer
 dispositivo_id | integer
 zona_id        | integer
 resuelta_por   | integer
 estado         | character varying
 observaciones  | text
 timestamp      | timestamp with time zone
 resuelta_en    | timestamp with time zone
(8 filas)
```

### `permisos`

```sql
SELECT id, codigo FROM public.permisos
WHERE codigo IN ('ver_roles', 'regenerar_token_dispositivo', 'gestionar_roles', 'gestionar_dispositivos');
```

Resultado:

```text
 id |         codigo         
----+------------------------
  6 | gestionar_dispositivos
  3 | gestionar_roles
(2 filas)
```

### `roles_permisos`

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'roles_permisos';
```

Resultado:

```text
 column_name 
-------------
 rol_id
 permiso_id
 otorgado_en
(3 filas)
```

```sql
SELECT indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'roles_permisos';
```

Resultado:

```text
 CREATE UNIQUE INDEX roles_permisos_pkey ON public.roles_permisos USING btree (rol_id, permiso_id)
 CREATE INDEX ix_roles_permisos_permiso ON public.roles_permisos USING btree (permiso_id)
```

---

## 2) Conclusión técnica

### Nota de resolución de alarmas

La tabla `alarmas` no tiene una columna aparte para la nota de resolución. Lo que existe es:

- `resuelta_por`
- `resuelta_en`
- `observaciones`

Esto confirma la observación de que el backend nuevo, si intenta guardar una nota aparte en una columna que no existe, terminará reutilizando `observaciones` y perdiendo el texto original, que era justamente el problema C2.

### Permisos faltantes

Los permisos que sí están presentes hoy son:

- `gestionar_dispositivos`
- `gestionar_roles`

Faltan:

- `ver_roles`
- `regenerar_token_dispositivo`

Eso explica por qué el panel y el backend pueden quedarse incoherentes si el guard usa un permiso que no está en la base.

### Estructura de `roles_permisos`

La tabla sí tiene la columna `otorgado_en` y además una llave única compuesta en `(rol_id, permiso_id)`, por lo que la migración con `ON CONFLICT DO NOTHING` es la opción correcta.

---

## 3) Migración correcta a aplicar

```sql
BEGIN;

INSERT INTO public.permisos (codigo, descripcion, modulo) VALUES
  ('regenerar_token_dispositivo', 'Regenerar token del dispositivo', 'dispositivos'),
  ('ver_roles',                   'Ver roles y permisos',            'roles')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.roles_permisos (rol_id, permiso_id, otorgado_en)
SELECT r.id, p.id, NOW()
FROM public.roles r
JOIN public.permisos p ON p.codigo IN ('regenerar_token_dispositivo', 'ver_roles')
WHERE r.nombre = 'superadmin'
ON CONFLICT DO NOTHING;

COMMIT;
```

---

## 4) Verificación esperada del paso 3

```sql
SELECT r.nombre AS rol, p.codigo
FROM public.roles_permisos rp
JOIN public.roles r    ON r.id = rp.rol_id
JOIN public.permisos p ON p.id = rp.permiso_id
WHERE p.codigo IN ('regenerar_token_dispositivo', 'ver_roles');
```

Deben salir dos filas con `superadmin`:

- `superadmin | regenerar_token_dispositivo`
- `superadmin | ver_roles`

---

## 5) Recomendación final

- No sobreescribir `observaciones` con la nota de resolución si no existe una columna separada.
- Insertar los permisos faltantes en la base antes de quitar el alias del guard de permisos.
- Asignar los permisos de forma explícita al `superadmin` para evitar que se rompa el acceso a la renovación del token y la vista de roles.
