import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Accesos } from "./Accesos.js";
import { Alarmas } from "./Alarmas.js";
import { IntentosFallidos } from "./IntentosFallidos.js";
import { LogsAuditoria } from "./LogsAuditoria.js";
import { Mantenimientos } from "./Mantenimientos.js";
import { Notificaciones } from "./Notificaciones.js";
import { Reportes } from "./Reportes.js";
import { Sesiones } from "./Sesiones.js";
import { UsuariosRoles } from "./UsuariosRoles.js";
import { Visitantes } from "./Visitantes.js";

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

  @OneToMany(() => Accesos, (accesos) => accesos.usuario)
  accesos: Accesos[];

  @OneToMany(() => Alarmas, (alarmas) => alarmas.resueltaPor2)
  alarmas: Alarmas[];

  @OneToMany(
    () => IntentosFallidos,
    (intentosFallidos) => intentosFallidos.usuario
  )
  intentosFallidos: IntentosFallidos[];

  @OneToMany(() => LogsAuditoria, (logsAuditoria) => logsAuditoria.usuario)
  logsAuditorias: LogsAuditoria[];

  @OneToMany(() => Mantenimientos, (mantenimientos) => mantenimientos.tecnico)
  mantenimientos: Mantenimientos[];

  @OneToMany(() => Notificaciones, (notificaciones) => notificaciones.usuario)
  notificaciones: Notificaciones[];

  @OneToMany(() => Reportes, (reportes) => reportes.usuario)
  reportes: Reportes[];

  @OneToMany(() => Sesiones, (sesiones) => sesiones.usuario)
  sesiones: Sesiones[];

  @OneToMany(() => UsuariosRoles, (usuariosRoles) => usuariosRoles.asignadoPor)
  usuariosRoles: UsuariosRoles[];

  @OneToMany(() => UsuariosRoles, (usuariosRoles) => usuariosRoles.usuario)
  usuariosRoles2: UsuariosRoles[];

  @OneToMany(() => Visitantes, (visitantes) => visitantes.anfitrion)
  visitantes: Visitantes[];

  constructor(init?: Partial<Usuarios>) {
    Object.assign(this, init);
  }
}
