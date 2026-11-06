import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Dispositivos } from "./Dispositivos.js";
import type { Usuarios } from "./Usuarios.js";
import type { Zonas } from "./Zonas.js";
import type { IntentosFallidos } from "./IntentosFallidos.js";
import type { Notificaciones } from "./Notificaciones.js";

@Index("ix_alarmas_dispositivo", ["dispositivoId"], {})
@Index("alarmas_pkey", ["id"], { unique: true })
@Index("ix_alarmas_resuelta_por", ["resueltaPor"], {})
@Index("ix_alarmas_activas", ["timestamp"], {})
@Index("ix_alarmas_zona", ["zonaId"], {})
@Entity("alarmas", { schema: "public" })
export class Alarmas {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "dispositivo_id" })
  dispositivoId: number;

  @Column("integer", { name: "zona_id" })
  zonaId: number;

  @Column("integer", { name: "resuelta_por", nullable: true })
  resueltaPor: number | null;

  @Column("character varying", {
    name: "estado",
    length: 15,
    default: () => "'activa'",
  })
  estado: string;

  @Column("text", { name: "observaciones", nullable: true })
  observaciones: string | null;

  @Column("text", { name: "observaciones_resolucion", nullable: true })
  observacionesResolucion: string | null;

  @Column("timestamp with time zone", {
    name: "timestamp",
    default: () => "now()",
  })
  timestamp: Date;

  @Column("timestamp with time zone", { name: "resuelta_en", nullable: true })
  resueltaEn: Date | null;

  @ManyToOne("Dispositivos", (dispositivos: Dispositivos) => dispositivos.alarmas, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "dispositivo_id", referencedColumnName: "id" }])
  dispositivo: Dispositivos;

  @ManyToOne("Usuarios", (usuarios: Usuarios) => usuarios.alarmas, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "resuelta_por", referencedColumnName: "id" }])
  resueltaPor2: Usuarios;

  @ManyToOne("Zonas", (zonas: Zonas) => zonas.alarmas, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "zona_id", referencedColumnName: "id" }])
  zona: Zonas;

  @OneToMany("IntentosFallidos", (intentosFallidos: IntentosFallidos) => intentosFallidos.alarma)
  intentosFallidos: IntentosFallidos[];

  notificaciones?: Notificaciones[];

  constructor(init?: Partial<Alarmas>) {
    Object.assign(this, init);
  }
}
