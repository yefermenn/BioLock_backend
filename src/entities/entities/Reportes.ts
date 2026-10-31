import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuarios } from "./Usuarios.js";

@Index("reportes_pkey", ["id"], { unique: true })
@Index("ix_reportes_usuario", ["usuarioId"], {})
@Entity("reportes", { schema: "public" })
export class Reportes {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "usuario_id" })
  usuarioId: number;

  @Column("character varying", { name: "tipo", length: 30 })
  tipo: string;

  @Column("character varying", { name: "formato", length: 10 })
  formato: string;

  @Column("jsonb", { name: "filtros", nullable: true })
  filtros: object | null;

  @Column("character varying", {
    name: "ruta_archivo",
    nullable: true,
    length: 255,
  })
  rutaArchivo: string | null;

  @Column("timestamp with time zone", {
    name: "generado_en",
    default: () => "now()",
  })
  generadoEn: Date;

  @Column("character varying", {
    name: "estado",
    length: 15,
    default: () => "'generando'",
  })
  estado: string;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.reportes, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "usuario_id", referencedColumnName: "id" }])
  usuario: Usuarios;

  constructor(init?: Partial<Reportes>) {
    Object.assign(this, init);
  }
}
