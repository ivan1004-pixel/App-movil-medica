import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PacientesService } from './pacientes.service';
import { Paciente } from './entities/paciente.entity';
import { CreatePacienteInput } from './dto/create-paciente.input';
import { UpdatePacienteInput } from './dto/update-paciente.input';

@Resolver(() => Paciente)
export class PacientesResolver {
  constructor(private readonly pacientesService: PacientesService) {}

  // 1. Crear: Cambiamos el nombre del argumento a 'input' para que sea más limpio
  @Mutation(() => Paciente, { name: 'createPaciente' })
  createPaciente(@Args('input') input: CreatePacienteInput) {
    return this.pacientesService.create(input);
  }

  // 2. Leer todos
  @Query(() => [Paciente], { name: 'pacientes' })
  findAll() {
    return this.pacientesService.findAll();
  }

  // 3. Buscar por Nombre (¡Tu nueva arma secreta!)
  @Query(() => [Paciente], { name: 'pacientesPorNombre' })
  buscarPorNombre(@Args('nombre', { type: () => String }) nombre: string) {
    return this.pacientesService.findByNombre(nombre);
  }

  // 4. Leer uno específico
  @Query(() => Paciente, { name: 'paciente' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.pacientesService.findOne(id);
  }

  // 5. Actualizar: También limpiamos el nombre a 'input'
  @Mutation(() => Paciente, { name: 'updatePaciente' })
  updatePaciente(@Args('input') input: UpdatePacienteInput) {
    return this.pacientesService.update(input.id, input);
  }

  // 6. Eliminar: Nos quedamos con tu lógica que es mejor para Apollo
  @Mutation(() => Paciente, { name: 'removePaciente' })
  removePaciente(@Args('id', { type: () => Int }) id: number) {
    return this.pacientesService.remove(id);
  }
}
