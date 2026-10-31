import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuarios } from "./Usuarios.js";

@Index("logs_auditoria_pkey", ["id"], { unique: true })
@Index("ix_logs_tabla_registro", ["registroId", "tablaAfectada"], {})
@Index("ix_logs_fecha", ["timestamp"], {})
@Index("ix_logs_usuario", ["usuarioId"], {})
@Entity("logs_auditoria", { schema: "public" })
export class LogsAuditoria {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "usuario_id", nullable: true })
  usuarioId: number | null;

  @Column("character varying", { name: "accion", length: 60 })
  accion: string;

  @Column("character varying", {
    name: "tabla_afectada",
    nullable: true,
    length: 40,
  })
  tablaAfectada: string | null;

  @Column("bigint", { name: "registro_id", nullable: true })
  registroId: string | null;

  @Column("inet", { name: "ip_origen", nullable: true })
  ipOrigen: string | null;

  @Column("jsonb", { name: "detalle", nullable: true })
  detalle: object | null;

  @Column("timestamp with time zone", {
    name: "timestamp",
    default: () => "now()",
  })
  timestamp: Date;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.logsAuditorias, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "usuario_id", referencedColumnName: "id" }])
  usuario: Usuarios;

  constructor(init?: Partial<LogsAuditoria>) {
    Object.assign(this, init);
  }
}
