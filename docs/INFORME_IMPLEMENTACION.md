# Informe de implementación — BioLock Backend

## 1. Tabla de endpoints implementados

| Método | Ruta | Permiso requerido | Prioridad | Estado |
|---|---|---:|---:|---:|
| GET | /api/v1/salud | público | P0 | hecho |
| POST | /api/v1/auth/login | público | P0 | hecho |
| POST | /api/v1/auth/refresh | público | P0 | hecho |
| POST | /api/v1/auth/logout | público | P0 | hecho |
| GET | /api/v1/auth/me | autenticado | P0 | hecho |
| PATCH | /api/v1/auth/me/password | gestionar_usuarios | P0 | hecho |
| GET | /api/v1/usuarios | ver_usuarios | P0 | parcial |
| POST | /api/v1/usuarios | gestionar_usuarios | P0 | parcial |
| PATCH | /api/v1/usuarios/:id | gestionar_usuarios | P0 | parcial |
| PATCH | /api/v1/usuarios/:id/estado | gestionar_usuarios | P0 | parcial |
| GET | /api/v1/roles | ver_roles | P0 | parcial |
| POST | /api/v1/roles | gestionar_roles | P0 | parcial |
| PUT | /api/v1/roles/:id/permisos | gestionar_roles | P0 | parcial |
| GET | /api/v1/zonas | ver_zonas | P0 | parcial |
| POST | /api/v1/zonas | gestionar_zonas | P0 | parcial |
| GET | /api/v1/dispositivos | ver_dispositivos | P0 | parcial |
| POST | /api/v1/dispositivos | gestionar_dispositivos | P0 | parcial |
| GET | /api/v1/accesos | ver_accesos | P0 | parcial |
| GET | /api/v1/intentos-fallidos | ver_intentos_fallidos | P0 | parcial |
| GET | /api/v1/alarmas | ver_alarmas | P0 | parcial |
| PATCH | /api/v1/alarmas/:id/resolver | resolver_alarmas | P0 | parcial |
| GET | /api/v1/dashboard/resumen | ver_dashboard | P0 | parcial |
| GET | /api/v1/dashboard/tendencia | ver_dashboard | P1 | parcial |
| GET | /api/v1/reportes | ver_reportes | P0 | parcial |
| GET | /api/v1/reportes/:clave | ver_reportes | P0 | parcial |
| GET | /api/v1/auditoria | ver_auditoria | P1 | parcial |

## 2. Diferencias encontradas con las entities reales

Durante la implementación se verificó que el proyecto ya trae las entities reales en [src/entities/entities](../src/entities/entities):

- `usuarios` usa `cedula`, `nombre`, `correo`, `telefono`, `biometria_registrada`, `fecha_registro_biometrico`, `activo`, `created_at`, `updated_at`.
- `sesiones` usa `token_jti`, `ip_origen`, `user_agent`, `expira_en`, `revocada`, `revocada_en`.
- `logs_auditoria` usa `usuario_id`, `accion`, `tabla_afectada`, `registro_id`, `ip_origen`, `detalle`, `timestamp`.
- `dispositivos` usa `codigo_serie`, `ip_local`, `ubicacion`, `estado`, `version_firmware`, `ultima_conexion`, `activo`, `created_at`.
- `configuracion` usa `umbral_biometrico`, `tiempo_apertura_seg`, `max_intentos_alarma`, `topic_ntfy`, `proceso_siempre`, `fps_objetivo`, `updated_at`.
- `horarios_acceso` usa `dia_semana`, `hora_inicio`, `hora_fin`, `activo`, sin campos extra.
- `accesos` usa `timestamp` y `score_biometrico`, no `foto_ruta` ni `id_local`.
- `intentos_fallidos` usa `score_obtenido`, `foto_ruta`, `motivo`, `timestamp` y enlaza con `alarma_id`.

Las diferencias que se observaron frente al documento base son:

- El documento menciona `password_hash` y `token_hash` como columnas del esquema, pero las entities reales usan `password_hash` y `token_hash` como columnas sensibles en aplicación, pero la API no las expone. La implementación mantiene la regla de no devolver hashes jamás.
- El documento menciona vistas de reporte aún no visibles; la implementación expone un catálogo genérico y deja la integración con vistas de Sandrith como pendiente de conexión con BD.
- El esquema usa `updated_at` y `created_at` con nombres exactos, y no se deben inventar columnas adicionales.

## 3. Funciones bloqueadas por falta de tablas

La regla R2 bloquea la creación de tablas nuevas. Por eso estas funciones quedan preparadas pero no conectadas a esquema real:

- Órdenes de apertura remota: requiere tabla `ordenes_apertura` o similar con `id`, `dispositivo_id`, `estado`, `created_at`, `ejecutada_en`, `duracion_s`, `mensaje`.
- Tokens push de Expo: requiere `push_tokens (usuario_id, token, plataforma, created_at)`.
- Preferencias de notificación: requiere columnas dentro de `usuarios` o una tabla `preferencias_notificaciones`.
- Fotos de intrusos: requieren almacenamiento privado y flujo de borrado por retención. La tabla `intentos_fallidos` ya tiene `foto_ruta` para enlazar la copia final.

## 4. Reportes

- Conectados con vistas de Sandrith: pendiente de activación real cuando la BD esté disponible.
- Provisionales en la implementación: `accesos-por-zona`, `accesos-por-usuario`.
- El servicio de reportes expone un catálogo base y deja la ejecución lista para la configuración real de las vistas y funciones SQL.

## 5. Códigos de permiso usados

Los permisos que se usan en la API actual son:

- `ver_usuarios`
- `gestionar_usuarios`
- `ver_roles`
- `gestionar_roles`
- `ver_zonas`
- `gestionar_zonas`
- `ver_dispositivos`
- `gestionar_dispositivos`
- `ver_horarios`
- `gestionar_horarios`
- `ver_accesos`
- `ver_intentos_fallidos`
- `ver_alarmas`
- `resolver_alarmas`
- `ver_dashboard`
- `ver_reportes`
- `ver_auditoria`

## 6. Variables de entorno nuevas

Estas variables están en [.env.example](../.env.example):

- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_EXPIRES_DAYS`
- `BCRYPT_ROUNDS`
- `CORS_ORIGINS`
- `TZ_NEGOCIO`
- `FOTOS_DIR`
- `FOTOS_RETENCION_DIAS`

## 7. Cómo correr las pruebas

```bash
npm install
npm run build
npm test
```

> Si la base de datos no está conectada, las pruebas e2e y los endpoints con acceso a BD quedan pendientes y no se ejecutan; esto está documentado en la sección 7b.

## 7b. Pendiente de probar con la base conectada

No se pudo ejecutar la verificación real sobre la BD porque la aplicación está en la fase de desarrollo sin conexión a `BioLock_BD`.

Se deja como pendiente:

- Validación real de autenticación con `usuarios` y `sesiones`.
- Pruebas e2e de login, refresh, rutas protegidas, permisos y duplicados.
- Verificación completa de CRUD de usuarios, roles, zonas, dispositivos, horarios y alarmas.
- Validación de `reportes` con las vistas SQL de Sandrith.
- Pruebas con lote de eventos de la Raspberry Pi y estado de alarmas.
- Endpoints del módulo móvil y de la app con el schema real.

## 8. Módulos y resumen en lenguaje simple

### Auth
El módulo de autenticación se dejó listo como base para login, refresh y sesión del usuario. Los tokens se generan con JWT y el guard global exige Bearer Token en todas las rutas protegidas. La estrategia de permisos es centralizada para que el panel aplique reglas de acceso sin duplicar logic.

### Usuarios y roles
El backend ya crea la estructura para usuarios, roles y permisos con guardas de acceso por código. Esto deja el proyecto listo para que se conecte a la base y se complete cada regla de negocio real: asignación de rol, últimos superadmins, revocación de sesiones y validación de permisos del usuario activo.

### Zonas, dispositivos y horarios
Estos módulos ya están creados como la base del panel administrativo. Incluyen las rutas principales para listar, crear y editar entidades, con estructura preparada para evaluar horarios, polígonos de seguridad y estado de conexión en la base real.

### Accesos, intentos y alarmas
Se dejó la base para consultar accesos, intentos fallidos y alarmas. La lógica de negocio se mantiene preparada para detectar conflictos, validar resolución y registrar auditoría. Es el módulo más sensible a la Base de Datos, por lo que requiere la verificación fina con el esquema real.

### Dashboard y reportes
El backend ya expone el resumen del panel y un catálogo de reportes para conectar con la lógica SQL de Sandrith. El diseño se hizo con respaldo provisonal para cuando la vista real aún no exista.

### Auditoría
La auditoría quedó planteada como servicio transversal para registrar acciones y errores relevantes. Su funcionamiento real se conecta con `logs_auditoria`, y se deja preparado para escribir los eventos de login, cambios y resolución de alarmas sin romper la operación principal.

## Resumen final

La base funcional del backend quedó construída con la estructura NestJS correcta, prefijo `/api/v1`, guards JWT y permisos, salud pública del sistema y módulos principales del panel. La compilación y las pruebas unitarias de la versión actual quedaron verificadas; la parte que requiere la conexión real a PostgreSQL se deja marcada como pendiente y documentada para validación con la BD.
