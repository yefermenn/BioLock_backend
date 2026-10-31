import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Usuarios } from "./Usuarios.js";
import { Roles } from "./Roles.js";

@Index("usuarios_roles_pkey", ["rolId", "usuarioId"], { unique: true })
@Index("ix_usuarios_roles_rol", ["rolId"], {})
@Entity("usuarios_roles", { schema: "public" })
export class UsuariosRoles {
  @Column("integer", { primary: true, name: "usuario_id" })
  usuarioId: number;

  @Column("integer", { primary: true, name: "rol_id" })
  rolId: number;

  @Column("timestamp with time zone", {
    name: "asignado_en",
    default: () => "now()",
  })
  asignadoEn: Date;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.usuariosRoles, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "asignado_por", referencedColumnName: "id" }])
  asignadoPor: Usuarios;

  @ManyToOne(() => Roles, (roles) => roles.usuariosRoles, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "rol_id", referencedColumnName: "id" }])
  rol: Roles;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.usuariosRoles2, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "usuario_id", referencedColumnName: "id" }])
  usuario: Usuarios;

  constructor(init?: Partial<UsuariosRoles>) {
    Object.assign(this, init);
  }
}
