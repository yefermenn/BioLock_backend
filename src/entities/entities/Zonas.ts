import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Accesos } from "./Accesos.js";
import { Alarmas } from "./Alarmas.js";
import { DispositivosZonas } from "./DispositivosZonas.js";
import { HorariosAcceso } from "./HorariosAcceso.js";
import { IntentosFallidos } from "./IntentosFallidos.js";
import { Visitantes } from "./Visitantes.js";

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

  @OneToMany(() => Accesos, (accesos) => accesos.zona)
  accesos: Accesos[];

  @OneToMany(() => Alarmas, (alarmas) => alarmas.zona)
  alarmas: Alarmas[];

  @OneToMany(
    () => DispositivosZonas,
    (dispositivosZonas) => dispositivosZonas.zona
  )
  dispositivosZonas: DispositivosZonas[];

  @OneToMany(() => HorariosAcceso, (horariosAcceso) => horariosAcceso.zona)
  horariosAccesos: HorariosAcceso[];

  @OneToMany(
    () => IntentosFallidos,
    (intentosFallidos) => intentosFallidos.zona
  )
  intentosFallidos: IntentosFallidos[];

  @OneToMany(() => Visitantes, (visitantes) => visitantes.zona)
  visitantes: Visitantes[];

  constructor(init?: Partial<Zonas>) {
    Object.assign(this, init);
  }
}
