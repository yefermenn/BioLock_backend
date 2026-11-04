import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { RolesPermisos } from "./RolesPermisos.js";
import type { UsuariosRoles } from "./UsuariosRoles.js";

@Index("roles_pkey", ["id"], { unique: true })
@Index("roles_nombre_key", ["nombre"], { unique: true })
@Entity("roles", { schema: "public" })
export class Roles {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "nombre", unique: true, length: 50 })
  nombre: string;

  @Column("text", { name: "descripcion", nullable: true })
  descripcion: string | null;

  @Column("boolean", { name: "activo", default: () => "true" })
  activo: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @OneToMany("RolesPermisos", (rolesPermisos: RolesPermisos) => rolesPermisos.rol)
  rolesPermisos: RolesPermisos[];

  @OneToMany("UsuariosRoles", (usuariosRoles: UsuariosRoles) => usuariosRoles.rol)
  usuariosRoles: UsuariosRoles[];

  constructor(init?: Partial<Roles>) {
    Object.assign(this, init);
  }
}
