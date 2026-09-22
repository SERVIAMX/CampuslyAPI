import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import { Persona } from '../../personas/domain/persona.entity.js';
import { Rol } from '../../roles/domain/rol.entity.js';

@Entity('Usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: string;

  @Column({ name: 'UserName', type: 'varchar', length: 200 })
  userName: string;

  @Column({
    name: 'Password',
    type: 'varchar',
    length: 500,
    nullable: true,
    select: false,
  })
  password: string | null;

  @Column({ name: 'IdPersona', type: 'bigint', nullable: true })
  idPersona: string | null;

  @Column({ name: 'IdRol', type: 'bigint', nullable: true })
  idRol: string | null;

  @CreateDateColumn({
    name: 'CreatedAt',
    type: 'datetime',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'UpdatedAt',
    type: 'datetime',
  })
  updatedAt: Date;

  @Column({
    name: 'Estatus',
    type: 'tinyint',
    default: Estatus.Activo,
  })
  estatus: number;

  @Column({
    name: 'ResetPasswordToken',
    type: 'varchar',
    length: 500,
    nullable: true,
    select: false,
  })
  resetPasswordToken: string | null;

  @Column({
    name: 'ResetPasswordExpiresAt',
    type: 'datetime',
    nullable: true,
    select: false,
  })
  resetPasswordExpiresAt: Date | null;

  @Column({ name: 'LastLoginAt', type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  /**
   * FK ya existe en DB (migraciones). createForeignKeyConstraints:false evita que
   * synchronize intente dropear/recrear índices de la constraint.
   */
  @ManyToOne(() => Persona, (persona) => persona.usuarios, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'IdPersona' })
  persona?: Persona | null;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'IdRol' })
  rol?: Rol | null;
}
