import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import type { Rol } from '../../roles/domain/rol.entity.js';

@Entity('CatProyectos')
export class Proyecto {
  @PrimaryGeneratedColumn({ type: 'int', name: 'Id' })
  id: number;

  @Column({ name: 'Nombre', type: 'varchar', length: 100, nullable: true })
  nombre: string | null;

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

  @OneToMany('Rol', 'proyecto')
  roles?: Rol[];
}
