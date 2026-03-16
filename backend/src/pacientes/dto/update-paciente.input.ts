import { CreatePacienteInput } from './create-paciente.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator'; // Añadimos esto igual que tu amigo

@InputType()
export class UpdatePacienteInput extends PartialType(CreatePacienteInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty({ message: 'El ID es necesario para actualizar el registro' })
  id: number;
}
