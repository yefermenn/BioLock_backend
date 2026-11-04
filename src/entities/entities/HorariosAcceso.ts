import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Zonas } from "./Zonas.js";

@Index("ix_horarios_zona_dia", ["diaSemana", "zonaId"], {})
@Index("horarios_acceso_pkey", ["id"], { unique: true })
@Entity("horarios_acceso", { schema: "public" })
export class HorariosAcceso {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "zona_id" })
  zonaId: number;

  @Column("smallint", { name: "dia_semana" })
  diaSemana: number;

  @Column("time without time zone", { name: "hora_inicio" })
  horaInicio: string;

  @Column("time without time zone", { name: "hora_fin" })
  horaFin: string;

  @Column("boolean", { name: "activo", default: () => "true" })
  activo: boolean;

  @ManyToOne("Zonas", (zonas: Zonas) => zonas.horariosAccesos, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "zona_id", referencedColumnName: "id" }])
  zona: Zonas;

  constructor(init?: Partial<HorariosAcceso>) {
    Object.assign(this, init);
  }
}
