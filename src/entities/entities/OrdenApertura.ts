import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Dispositivos } from './Dispositivos.js';
import type { Usuarios } from './Usuarios.js';

export type EstadoOrdenApertura = 'pendiente' | 'ejecutada' | 'fallida' | 'timeout';

@Index('ordenes_apertura_pkey', ['id'], { unique: true })
@Index('ix_ordenes_apertura_dispositivo_estado', ['dispositivoId', 'estado'], {})
@Index('ix_ordenes_apertura_creada_en', ['creadaEn'], {})
@Entity('ordenes_apertura', { schema: 'public' })
export class OrdenApertura {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'dispositivo_id' })
  dispositivoId: number;

  @Column('integer', { name: 'usuario_id', nullable: true })
  usuarioId: number | null;

  @Column('character varying', { name: 'estado', length: 15, default: () => "'pendiente'" })
  estado: EstadoOrdenApertura;

  @Column('timestamp with time zone', { name: 'creada_en', default: () => 'now()' })
  creadaEn: Date;

  @Column('timestamp with time zone', { name: 'ejecutada_en', nullable: true })
  ejecutadaEn: Date | null;

  @Column('numeric', { name: 'duracion_s', nullable: true, precision: 10, scale: 3 })
  duracionS: string | null;

  @Column('text', { name: 'mensaje', nullable: true })
  mensaje: string | null;

  @ManyToOne('Dispositivos', { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'dispositivo_id', referencedColumnName: 'id' }])
  dispositivo: Dispositivos;

  @ManyToOne('Usuarios', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn([{ name: 'usuario_id', referencedColumnName: 'id' }])
  usuario: Usuarios | null;

  constructor(init?: Partial<OrdenApertura>) {
    Object.assign(this, init);
  }
}
