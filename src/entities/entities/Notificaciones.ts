import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Alarmas } from "./Alarmas.js";
import type { Usuarios } from "./Usuarios.js";

@Index("ix_notif_alarma", ["alarmaId"], {})
@Index("notificaciones_pkey", ["id"], { unique: true })
@Index("ix_notif_usuario", ["usuarioId"], {})
@Entity("notificaciones", { schema: "public" })
export class Notificaciones {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "alarma_id" })
  alarmaId: number;

  @Column("integer", { name: "usuario_id", nullable: true })
  usuarioId: number | null;

  @Column("character varying", { name: "canal", length: 20 })
  canal: string;

  @Column("character varying", { name: "destinatario", length: 150 })
  destinatario: string;

  @Column("character varying", {
    name: "estado",
    length: 15,
    default: () => "'enviada'",
  })
  estado: string;

  @Column("timestamp with time zone", {
    name: "enviada_en",
    default: () => "now()",
  })
  enviadaEn: Date;

  @ManyToOne("Alarmas", (alarmas: Alarmas) => alarmas.notificaciones, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "alarma_id", referencedColumnName: "id" }])
  alarma: Alarmas;

  @ManyToOne("Usuarios", (usuarios: Usuarios) => usuarios.notificaciones, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "usuario_id", referencedColumnName: "id" }])
  usuario: Usuarios;

  constructor(init?: Partial<Notificaciones>) {
    Object.assign(this, init);
  }
}
