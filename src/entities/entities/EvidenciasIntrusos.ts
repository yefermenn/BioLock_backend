import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Alarmas } from './Alarmas.js';
import type { Dispositivos } from './Dispositivos.js';
import type { IntentosFallidos } from './IntentosFallidos.js';

@Index('evidencias_intrusos_alarma_key', ['alarmaId'], { unique: true })
@Index('evidencias_intrusos_expira_idx', ['expiraEn'], {})
@Entity('evidencias_intrusos', { schema: 'public' })
export class EvidenciasIntrusos {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' }) id: number;
  @Column('integer', { name: 'dispositivo_id' }) dispositivoId: number;
  @Column('bigint', { name: 'intento_id', nullable: true }) intentoId: string | null;
  @Column('integer', { name: 'alarma_id', nullable: true }) alarmaId: number | null;
  @Column('character varying', { name: 'id_local', length: 255 }) idLocal: string;
  @Column('text', { name: 'ruta_archivo' }) rutaArchivo: string;
  @Column('character varying', { name: 'mime_tipo', length: 50, default: () => "'image/jpeg'" }) mimeTipo: string;
  @Column('timestamp with time zone', { name: 'creada_en', default: () => 'now()' }) creadaEn: Date;
  @Column('timestamp with time zone', { name: 'expira_en' }) expiraEn: Date;
  @Column('boolean', { name: 'expirada', default: () => 'false' }) expirada: boolean;

  @ManyToOne('Alarmas', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'alarma_id', referencedColumnName: 'id' }) alarma: Alarmas;
  @ManyToOne('Dispositivos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispositivo_id', referencedColumnName: 'id' }) dispositivo: Dispositivos;
  @ManyToOne('IntentosFallidos', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'intento_id', referencedColumnName: 'id' }) intento: IntentosFallidos;
}
