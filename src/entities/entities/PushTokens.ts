import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Usuarios } from './Usuarios.js';

@Index('push_tokens_usuario_token_key', ['usuarioId', 'token'], { unique: true })
@Index('push_tokens_token_key', ['token'], { unique: true })
@Entity('push_tokens', { schema: 'public' })
export class PushTokens {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' }) id: number;
  @Column('integer', { name: 'usuario_id' }) usuarioId: number;
  @Column('character varying', { name: 'token', length: 255, unique: true }) token: string;
  @Column('character varying', { name: 'plataforma', length: 20 }) plataforma: string;
  @Column('timestamp with time zone', { name: 'created_at', default: () => 'now()' }) createdAt: Date;
  @Column('timestamp with time zone', { name: 'updated_at', default: () => 'now()' }) updatedAt: Date;

  @ManyToOne('Usuarios', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: Usuarios;
}
