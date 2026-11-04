import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Usuarios } from "./Usuarios.js";

@Index("ix_sesiones_vigentes", ["expiraEn"], {})
@Index("sesiones_pkey", ["id"], { unique: true })
@Index("sesiones_token_jti_key", ["tokenJti"], { unique: true })
@Index("ix_sesiones_usuario", ["usuarioId"], {})
@Entity("sesiones", { schema: "public" })
export class Sesiones {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "usuario_id" })
  usuarioId: number;

  @Column("character varying", { name: "token_jti", unique: true, length: 64 })
  tokenJti: string;

  @Column("inet", { name: "ip_origen", nullable: true })
  ipOrigen: string | null;

  @Column("character varying", {
    name: "user_agent",
    nullable: true,
    length: 255,
  })
  userAgent: string | null;

  @Column("timestamp with time zone", {
    name: "creado_en",
    default: () => "now()",
  })
  creadoEn: Date;

  @Column("timestamp with time zone", { name: "expira_en" })
  expiraEn: Date;

  @Column("boolean", { name: "revocada", default: () => "false" })
  revocada: boolean;

  @Column("timestamp with time zone", { name: "revocada_en", nullable: true })
  revocadaEn: Date | null;

  @ManyToOne("Usuarios", (usuarios: Usuarios) => usuarios.sesiones, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "usuario_id", referencedColumnName: "id" }])
  usuario: Usuarios;

  constructor(init?: Partial<Sesiones>) {
    Object.assign(this, init);
  }
}
