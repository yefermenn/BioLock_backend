import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Dispositivos } from "./Dispositivos.js";

@Index("configuracion_dispositivo_id_key", ["dispositivoId"], { unique: true })
@Index("configuracion_pkey", ["id"], { unique: true })
@Entity("configuracion", { schema: "public" })
export class Configuracion {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "dispositivo_id", unique: true })
  dispositivoId: number;

  @Column("numeric", {
    name: "umbral_biometrico",
    precision: 4,
    scale: 2,
    default: () => "0.55",
  })
  umbralBiometrico: string;

  @Column("smallint", { name: "tiempo_apertura_seg", default: () => "6" })
  tiempoAperturaSeg: number;

  @Column("smallint", { name: "max_intentos_alarma", default: () => "3" })
  maxIntentosAlarma: number;

  @Column("character varying", {
    name: "topic_ntfy",
    nullable: true,
    length: 80,
  })
  topicNtfy: string | null;

  @Column("boolean", { name: "proceso_siempre", default: () => "false" })
  procesoSiempre: boolean;

  @Column("smallint", { name: "fps_objetivo", default: () => "25" })
  fpsObjetivo: number;

  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "now()",
  })
  updatedAt: Date;

  @OneToOne("Dispositivos", (dispositivos: Dispositivos) => dispositivos.configuracion, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "dispositivo_id", referencedColumnName: "id" }])
  dispositivo: Dispositivos;

  constructor(init?: Partial<Configuracion>) {
    Object.assign(this, init);
  }
}
