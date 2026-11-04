import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Accesos } from "./Accesos.js";
import type { Alarmas } from "./Alarmas.js";
import type { DispositivosZonas } from "./DispositivosZonas.js";
import type { HorariosAcceso } from "./HorariosAcceso.js";
import type { IntentosFallidos } from "./IntentosFallidos.js";
import type { Visitantes } from "./Visitantes.js";

@Index("zonas_pkey", ["id"], { unique: true })
@Entity("zonas", { schema: "public" })
export class Zonas {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "nombre", length: 80 })
  nombre: string;

  @Column("text", { name: "descripcion", nullable: true })
  descripcion: string | null;

  @Column("smallint", { name: "nivel_seguridad", default: () => "1" })
  nivelSeguridad: number;

  @Column("boolean", { name: "activa", default: () => "true" })
  activa: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @OneToMany("DispositivosZonas", (dispositivosZonas: DispositivosZonas) => dispositivosZonas.zona)
  dispositivosZonas: DispositivosZonas[];

  @OneToMany("HorariosAcceso", (horariosAcceso: HorariosAcceso) => horariosAcceso.zona)
  horariosAccesos: HorariosAcceso[];

  accesos?: Accesos[];
  alarmas?: Alarmas[];
  intentosFallidos?: IntentosFallidos[];
  visitantes?: Visitantes[];

  constructor(init?: Partial<Zonas>) {
    Object.assign(this, init);
  }
}
