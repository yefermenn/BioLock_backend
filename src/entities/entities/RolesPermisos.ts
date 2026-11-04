import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import type { Permisos } from "./Permisos.js";
import type { Roles } from "./Roles.js";

@Index("roles_permisos_pkey", ["permisoId", "rolId"], { unique: true })
@Index("ix_roles_permisos_permiso", ["permisoId"], {})
@Entity("roles_permisos", { schema: "public" })
export class RolesPermisos {
  @Column("integer", { primary: true, name: "rol_id" })
  rolId: number;

  @Column("integer", { primary: true, name: "permiso_id" })
  permisoId: number;

  @Column("timestamp with time zone", {
    name: "otorgado_en",
    default: () => "now()",
  })
  otorgadoEn: Date;

  @ManyToOne("Permisos", (permisos: Permisos) => permisos.rolesPermisos, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "permiso_id", referencedColumnName: "id" }])
  permiso: Permisos;

  @ManyToOne("Roles", (roles: Roles) => roles.rolesPermisos, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "rol_id", referencedColumnName: "id" }])
  rol: Roles;

  constructor(init?: Partial<RolesPermisos>) {
    Object.assign(this, init);
  }
}
