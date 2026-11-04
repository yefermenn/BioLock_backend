import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Usuarios } from "./Usuarios.js";
import type { Zonas } from "./Zonas.js";

@Index("ix_visitantes_anfitrion", ["anfitrionId"], {})
@Index("ix_visitantes_cedula", ["cedula"], {})
@Index("visitantes_pkey", ["id"], { unique: true })
@Index(
  "ix_visitantes_zona_ventana",
  ["validoDesde", "validoHasta", "zonaId"],
  {}
)
@Entity("visitantes", { schema: "public" })
export class Visitantes {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "cedula", length: 20 })
  cedula: string;

  @Column("character varying", { name: "nombre", length: 100 })
  nombre: string;

  @Column("character varying", { name: "motivo_visita", length: 200 })
  motivoVisita: string;

  @Column("integer", { name: "anfitrion_id" })
  anfitrionId: number;

  @Column("integer", { name: "zona_id" })
  zonaId: number;

  @Column("timestamp with time zone", { name: "valido_desde" })
  validoDesde: Date;

  @Column("timestamp with time zone", { name: "valido_hasta" })
  validoHasta: Date;

  @Column("character varying", {
    name: "estado",
    length: 15,
    default: () => "'pendiente'",
  })
  estado: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @ManyToOne("Usuarios", (usuarios: Usuarios) => usuarios.visitantes, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "anfitrion_id", referencedColumnName: "id" }])
  anfitrion: Usuarios;

  @ManyToOne("Zonas", (zonas: Zonas) => zonas.visitantes, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "zona_id", referencedColumnName: "id" }])
  zona: Zonas;

  constructor(init?: Partial<Visitantes>) {
    Object.assign(this, init);
  }
}
