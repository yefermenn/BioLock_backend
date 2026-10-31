import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RolesPermisos } from "./RolesPermisos.js";

@Index("permisos_codigo_key", ["codigo"], { unique: true })
@Index("permisos_pkey", ["id"], { unique: true })
@Entity("permisos", { schema: "public" })
export class Permisos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "codigo", unique: true, length: 60 })
  codigo: string;

  @Column("text", { name: "descripcion" })
  descripcion: string;

  @Column("character varying", { name: "modulo", length: 40 })
  modulo: string;

  @OneToMany(() => RolesPermisos, (rolesPermisos) => rolesPermisos.permiso)
  rolesPermisos: RolesPermisos[];

  constructor(init?: Partial<Permisos>) {
    Object.assign(this, init);
  }
}
