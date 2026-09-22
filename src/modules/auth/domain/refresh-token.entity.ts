import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/domain/usuario.entity.js';

@Entity('RefreshTokens')
export class RefreshToken {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: string;

  @Column({ name: 'IdUsuario', type: 'bigint' })
  idUsuario: string;

  @ManyToOne(() => Usuario, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'IdUsuario' })
  usuario?: Usuario;

  @Column({ name: 'Token', type: 'text' })
  token: string;

  @Column({ name: 'ExpiresAt', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'IsRevoked', type: 'tinyint', default: 0 })
  isRevoked: number;

  @Column({ name: 'IpAddress', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'UserAgent', type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt', type: 'datetime' })
  updatedAt: Date;
}
