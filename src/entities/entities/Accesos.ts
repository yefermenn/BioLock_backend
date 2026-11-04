import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Dispositivos } from "./Dispositivos.js";
import type { Usuarios } from "./Usuarios.js";
import type { Zonas } from "./Zonas.js";

@Index("ix_accesos_dispositivo", ["dispositivoId"], {})
@Index("accesos_pkey", ["id"], { unique: true })
@Index("ix_accesos_fecha", ["timestamp"], {})
@Index("ix_accesos_zona_fecha", ["timestamp", "zonaId"], {})
@Index("ix_accesos_usuario", ["usuarioId"], {})
@Entity("accesos", { schema: "public" })
export class Accesos {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "usuario_id", nullable: true })
  usuarioId: number | null;

  @Column("integer", { name: "dispositivo_id" })
  dispositivoId: number;

  @Column("integer", { name: "zona_id" })
  zonaId: number;

  @Column("character varying", { name: "tipo_acceso", length: 15 })
  tipoAcceso: string;

  @Column("numeric", {
    name: "score_biometrico",
    nullable: true,
    precision: 5,
    scale: 4,
  })
  scoreBiometrico: string | null;

  @Column("timestamp with time zone", {
    name: "timestamp",
    default: () => "now()",
  })
  timestamp: Date;

  @ManyToOne("Dispositivos", (dispositivos: Dispositivos) => dispositivos.accesos, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "dispositivo_id", referencedColumnName: "id" }])
  dispositivo: Dispositivos;

  @ManyToOne("Usuarios", (usuarios: Usuarios) => usuarios.accesos, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "usuario_id", referencedColumnName: "id" }])
  usuario: Usuarios;

  @ManyToOne("Zonas", (zonas: Zonas) => zonas.accesos, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "zona_id", referencedColumnName: "id" }])
  zona: Zonas;

  constructor(init?: Partial<Accesos>) {
    Object.assign(this, init);
  }
}
