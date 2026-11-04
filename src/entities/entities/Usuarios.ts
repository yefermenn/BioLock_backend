import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Accesos } from "./Accesos.js";
import type { Alarmas } from "./Alarmas.js";
import type { IntentosFallidos } from "./IntentosFallidos.js";
import type { LogsAuditoria } from "./LogsAuditoria.js";
import type { Mantenimientos } from "./Mantenimientos.js";
import type { Notificaciones } from "./Notificaciones.js";
import type { Reportes } from "./Reportes.js";
import type { Sesiones } from "./Sesiones.js";
import type { UsuariosRoles } from "./UsuariosRoles.js";
import type { Visitantes } from "./Visitantes.js";

@Index("usuarios_cedula_key", ["cedula"], { unique: true })
@Index("usuarios_correo_key", ["correo"], { unique: true })
@Index("usuarios_pkey", ["id"], { unique: true })
@Entity("usuarios", { schema: "public" })
export class Usuarios {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "cedula", unique: true, length: 20 })
  cedula: string;

  @Column("character varying", { name: "nombre", length: 100 })
  nombre: string;

  @Column("character varying", { name: "correo", unique: true, length: 150 })
  correo: string;

  @Column("character varying", {
    name: "password_hash",
    nullable: true,
    select: false,
    length: 255,
  })
  passwordHash: string | null;

  @Column("character varying", { name: "telefono", nullable: true, length: 15 })
  telefono: string | null;

  @Column("boolean", { name: "biometria_registrada", default: () => "false" })
  biometriaRegistrada: boolean;

  @Column("timestamp with time zone", {
    name: "fecha_registro_biometrico",
    nullable: true,
  })
  fechaRegistroBiometrico: Date | null;

  @Column("boolean", { name: "activo", default: () => "true" })
  activo: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "now()",
  })
  updatedAt: Date;

  @OneToMany("UsuariosRoles", (usuariosRoles: UsuariosRoles) => usuariosRoles.asignadoPor)
  usuariosRoles: UsuariosRoles[];

  @OneToMany("UsuariosRoles", (usuariosRoles: UsuariosRoles) => usuariosRoles.usuario)
  usuariosRoles2: UsuariosRoles[];

  accesos?: Accesos[];
  alarmas?: Alarmas[];
  intentosFallidos?: IntentosFallidos[];
  logsAuditorias?: LogsAuditoria[];
  mantenimientos?: Mantenimientos[];
  notificaciones?: Notificaciones[];
  reportes?: Reportes[];
  sesiones?: Sesiones[];
  visitantes?: Visitantes[];

  constructor(init?: Partial<Usuarios>) {
    Object.assign(this, init);
  }
}
