import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Accesos } from "./Accesos.js";
import { Alarmas } from "./Alarmas.js";
import { Configuracion } from "./Configuracion.js";
import { DispositivosZonas } from "./DispositivosZonas.js";
import { IntentosFallidos } from "./IntentosFallidos.js";
import { Mantenimientos } from "./Mantenimientos.js";

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

  @OneToMany(() => Accesos, (accesos) => accesos.dispositivo)
  accesos: Accesos[];

  @OneToMany(() => Alarmas, (alarmas) => alarmas.dispositivo)
  alarmas: Alarmas[];

  @OneToOne(() => Configuracion, (configuracion) => configuracion.dispositivo)
  configuracion: Configuracion;

  @OneToMany(
    () => DispositivosZonas,
    (dispositivosZonas) => dispositivosZonas.dispositivo
  )
  dispositivosZonas: DispositivosZonas[];

  @OneToMany(
    () => IntentosFallidos,
    (intentosFallidos) => intentosFallidos.dispositivo
  )
  intentosFallidos: IntentosFallidos[];

  @OneToMany(
    () => Mantenimientos,
    (mantenimientos) => mantenimientos.dispositivo
  )
  mantenimientos: Mantenimientos[];

  constructor(init?: Partial<Dispositivos>) {
    Object.assign(this, init);
  }
}
