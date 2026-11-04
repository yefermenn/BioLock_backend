import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Accesos } from "./Accesos.js";
import type { Alarmas } from "./Alarmas.js";
import type { Configuracion } from "./Configuracion.js";
import type { DispositivosZonas } from "./DispositivosZonas.js";
import type { IntentosFallidos } from "./IntentosFallidos.js";
import type { Mantenimientos } from "./Mantenimientos.js";

@Index("dispositivos_codigo_serie_key", ["codigoSerie"], { unique: true })
@Index("dispositivos_pkey", ["id"], { unique: true })
@Entity("dispositivos", { schema: "public" })
export class Dispositivos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "nombre", length: 80 })
  nombre: string;

  @Column("character varying", {
    name: "codigo_serie",
    unique: true,
    length: 40,
  })
  codigoSerie: string;

  @Column("inet", { name: "ip_local", nullable: true })
  ipLocal: string | null;

  @Column("character varying", { name: "ubicacion", length: 150 })
  ubicacion: string;

  @Column("character varying", {
    name: "estado",
    length: 10,
    default: () => "'offline'",
  })
  estado: string;

  @Column("character varying", {
    name: "token_hash",
    nullable: true,
    length: 255,
    select: false,
  })
  tokenHash: string | null;

  @Column("character varying", {
    name: "version_firmware",
    nullable: true,
    length: 20,
  })
  versionFirmware: string | null;

  @Column("timestamp with time zone", {
    name: "ultima_conexion",
    nullable: true,
  })
  ultimaConexion: Date | null;

  @Column("boolean", { name: "activo", default: () => "true" })
  activo: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @OneToOne("Configuracion", (configuracion: Configuracion) => configuracion.dispositivo)
  configuracion: Configuracion;

  @OneToMany("DispositivosZonas", (dispositivosZonas: DispositivosZonas) => dispositivosZonas.dispositivo)
  dispositivosZonas: DispositivosZonas[];

  accesos?: Accesos[];
  alarmas?: Alarmas[];
  intentosFallidos?: IntentosFallidos[];
  mantenimientos?: Mantenimientos[];

  constructor(init?: Partial<Dispositivos>) {
    Object.assign(this, init);
  }
}
