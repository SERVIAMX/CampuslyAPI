import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import type { Usuario } from '../../usuarios/domain/usuario.entity.js';

export type Genero = 'M' | 'F' | 'Otro';

@Entity('Personas')
export class Persona {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: string;

  @Index('IDX_Persona_CURP')
  @Column({
    name: 'CURP',
    type: 'varchar',
    length: 18,
    unique: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  curp: string;

  @Column({
    name: 'Nombre',
    type: 'varchar',
    length: 100,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  nombre: string;

  @Column({
    name: 'ApellidoPaterno',
    type: 'varchar',
    length: 100,
    nullable: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  apellidoPaterno: string | null;

  @Column({
    name: 'ApellidoMaterno',
    type: 'varchar',
    length: 100,
    nullable: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  apellidoMaterno: string | null;

  @Column({ name: 'FechaNacimiento', type: 'date', nullable: true })
  fechaNacimiento: string | null;

  @Column({
    name: 'Genero',
    type: 'enum',
    enum: ['M', 'F', 'Otro'],
    nullable: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  genero: Genero | null;

  @Column({
    name: 'Fotografia',
    type: 'varchar',
    length: 500,
    nullable: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  fotografia: string | null;

  @Index('IDX_Persona_Email')
  @Column({
    name: 'Email',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  email: string | null;

  @Column({
    name: 'Telefono',
    type: 'varchar',
    length: 20,
    nullable: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  telefono: string | null;

  @CreateDateColumn({
    name: 'CreatedAt',
    type: 'timestamp',
  })
  createdAt: Date;

  @Column({
    name: 'Estatus',
    type: 'tinyint',
    default: Estatus.Activo,
  })
  estatus: number;

  @OneToMany('Usuario', 'persona')
  usuarios?: Usuario[];
}
