import { ObjectType, Field, Int, ID } from '@nestjs/graphql'; // Añadimos ID
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('pacientes') // Le damos el nombre explícito en plural
export class Paciente {

  @Field(() => ID) // Mejor práctica para llaves primarias en GraphQL
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  nombre: string;

  @Field(() => String)
  @Column()
  apellido: string;

  // Nos quedamos con string para mayor seguridad en el examen
  @Field(() => String)
  @Column()
  fecha_nacimiento: string;

  @Field(() => String)
  @Column()
  genero: string;

  @Field(() => String)
  @Column()
  telefono: string;

  @Field(() => String)
  @Column()
  correo: string;

  @Field(() => String)
  @Column()
  direccion: string;

  @Field(() => String)
  @Column()
  ciudad: string;

  @Field(() => String)
  @Column()
  estado: string;

  @Field(() => Int)
  @Column('int')
  codigo_postal: number;

  @Field(() => String)
  @Column()
  tipo_sangre: string;

  @Field(() => String)
  @Column('text')
  alergias: string;

  @Field(() => String)
  @Column('text')
  enfermedades_cronicas: string;

  @Field(() => String)
  @Column('text')
  medicamentos: string;

  @Field(() => String)
  @Column()
  contacto_emergencia: string;

  @Field(() => String)
  @Column()
  telefono_emergencia: string;
}
