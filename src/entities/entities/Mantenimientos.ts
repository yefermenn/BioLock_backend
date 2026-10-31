import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dispositivos } from "./Dispositivos.js";
import { Usuarios } from "./Usuarios.js";

@Index("ix_mant_dispositivo", ["dispositivoId"], {})
@Index("mantenimientos_pkey", ["id"], { unique: true })
@Index("ix_mant_tecnico", ["tecnicoId"], {})
@Entity("mantenimientos", { schema: "public" })
export class Mantenimientos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "dispositivo_id" })
  dispositivoId: number;

  @Column("integer", { name: "tecnico_id", nullable: true })
  tecnicoId: number | null;

  @Column("character varying", { name: "tipo", length: 20 })
  tipo: string;

  @Column("text", { name: "descripcion" })
  descripcion: string;

  @Column("date", { name: "fecha_programada", nullable: true })
  fechaProgramada: string | null;

  @Column("timestamp with time zone", {
    name: "fecha_realizada",
    nullable: true,
  })
  fechaRealizada: Date | null;

  @Column("character varying", {
    name: "estado",
    length: 15,
    default: () => "'programado'",
  })
  estado: string;

  @Column("numeric", { name: "costo", nullable: true, precision: 10, scale: 2 })
  costo: string | null;

  @Column("text", { name: "observaciones", nullable: true })
  observaciones: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @ManyToOne(
    () => Dispositivos,
    (dispositivos) => dispositivos.mantenimientos,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([{ name: "dispositivo_id", referencedColumnName: "id" }])
  dispositivo: Dispositivos;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.mantenimientos, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "tecnico_id", referencedColumnName: "id" }])
  tecnico: Usuarios;

  constructor(init?: Partial<Mantenimientos>) {
    Object.assign(this, init);
  }
}
