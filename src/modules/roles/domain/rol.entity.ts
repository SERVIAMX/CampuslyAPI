import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import { Proyecto } from '../../proyectos/domain/proyecto.entity.js';
import type { Usuario } from '../../usuarios/domain/usuario.entity.js';

@Entity('CatRoles')
export class Rol {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: string;

  @Column({ name: 'Nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'IdProyecto', type: 'int' })
  idProyecto: number;

  @Column({
    name: 'Estatus',
    type: 'tinyint',
    default: Estatus.Activo,
  })
  estatus: number;

  @CreateDateColumn({
    name: 'CreatedAt',
    type: 'datetime',
  })
  createdAt: Date;

  /** FK gestionada por migraciones; no por synchronize. */
  @ManyToOne(() => Proyecto, (proyecto) => proyecto.roles, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'IdProyecto' })
  proyecto?: Proyecto;

  @OneToMany('Usuario', 'rol')
  usuarios?: Usuario[];
}
