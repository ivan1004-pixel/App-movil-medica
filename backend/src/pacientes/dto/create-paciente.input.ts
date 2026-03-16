import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEmail, IsInt, IsOptional } from 'class-validator';

@InputType()
export class CreatePacienteInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fecha_nacimiento: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  genero: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @Field(() => String)
  @IsEmail({}, { message: 'El formato del correo es incorrecto' })
  @IsNotEmpty()
  correo: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  estado: string;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  codigo_postal: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  tipo_sangre: string;

  @Field(() => String)
  @IsString()
  @IsOptional() // Alergias puede quedar vacío si no tiene
  alergias: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  enfermedades_cronicas: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  medicamentos: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  contacto_emergencia: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  telefono_emergencia: string;
}
