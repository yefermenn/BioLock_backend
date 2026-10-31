import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Dispositivos } from "./Dispositivos.js";
import { Zonas } from "./Zonas.js";

@Index("dispositivos_zonas_pkey", ["dispositivoId", "zonaId"], { unique: true })
@Index("ix_disp_zonas_zona", ["zonaId"], {})
@Entity("dispositivos_zonas", { schema: "public" })
export class DispositivosZonas {
  @Column("integer", { primary: true, name: "dispositivo_id" })
  dispositivoId: number;

  @Column("integer", { primary: true, name: "zona_id" })
  zonaId: number;

  @Column("boolean", { name: "activo", default: () => "true" })
  activo: boolean;

  @Column("timestamp with time zone", {
    name: "instalado_en",
    default: () => "now()",
  })
  instaladoEn: Date;

  @ManyToOne(
    () => Dispositivos,
    (dispositivos) => dispositivos.dispositivosZonas,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "dispositivo_id", referencedColumnName: "id" }])
  dispositivo: Dispositivos;

  @ManyToOne(() => Zonas, (zonas) => zonas.dispositivosZonas, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "zona_id", referencedColumnName: "id" }])
  zona: Zonas;

  constructor(init?: Partial<DispositivosZonas>) {
    Object.assign(this, init);
  }
}
