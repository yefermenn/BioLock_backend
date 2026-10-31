import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Alarmas } from "./Alarmas.js";
import { Dispositivos } from "./Dispositivos.js";
import { Usuarios } from "./Usuarios.js";
import { Zonas } from "./Zonas.js";

@Index("ix_intentos_alarma", ["alarmaId"], {})
@Index("ix_intentos_disp_fecha", ["dispositivoId", "timestamp"], {})
@Index("intentos_fallidos_pkey", ["id"], { unique: true })
@Index("ix_intentos_usuario", ["usuarioId"], {})
@Index("ix_intentos_zona", ["zonaId"], {})
@Entity("intentos_fallidos", { schema: "public" })
export class IntentosFallidos {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "dispositivo_id" })
  dispositivoId: number;

  @Column("integer", { name: "zona_id" })
  zonaId: number;

  @Column("integer", { name: "usuario_id", nullable: true })
  usuarioId: number | null;

  @Column("integer", { name: "alarma_id", nullable: true })
  alarmaId: number | null;

  @Column("numeric", {
    name: "score_obtenido",
    nullable: true,
    precision: 5,
    scale: 4,
  })
  scoreObtenido: string | null;

  @Column("character varying", {
    name: "foto_ruta",
    nullable: true,
    length: 255,
  })
  fotoRuta: string | null;

  @Column("character varying", { name: "motivo", length: 50 })
  motivo: string;

  @Column("timestamp with time zone", {
    name: "timestamp",
    default: () => "now()",
  })
  timestamp: Date;

  @ManyToOne(() => Alarmas, (alarmas) => alarmas.intentosFallidos, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "alarma_id", referencedColumnName: "id" }])
  alarma: Alarmas;

  @ManyToOne(
    () => Dispositivos,
    (dispositivos) => dispositivos.intentosFallidos,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([{ name: "dispositivo_id", referencedColumnName: "id" }])
  dispositivo: Dispositivos;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.intentosFallidos, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "usuario_id", referencedColumnName: "id" }])
  usuario: Usuarios;

  @ManyToOne(() => Zonas, (zonas) => zonas.intentosFallidos, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "zona_id", referencedColumnName: "id" }])
  zona: Zonas;

  constructor(init?: Partial<IntentosFallidos>) {
    Object.assign(this, init);
  }
}
