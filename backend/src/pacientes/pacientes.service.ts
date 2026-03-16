import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePacienteInput } from './dto/create-paciente.input';
import { UpdatePacienteInput } from './dto/update-paciente.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  // 1. Crear un paciente (Cambiamos el argumento a 'input' para más limpieza)
  create(input: CreatePacienteInput) {
    const nuevoPaciente = this.pacientesRepository.create(input);
    return this.pacientesRepository.save(nuevoPaciente);
  }

  // 2. Ver todos los pacientes
  findAll() {
    return this.pacientesRepository.find();
  }

  // 3. Buscar pacientes por nombre (¡Aquí está la función que faltaba!)
  findByNombre(nombre: string) {
    return this.pacientesRepository.createQueryBuilder("paciente")
    .where("paciente.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
    .getMany();
  }

  // 4. Ver un paciente en específico
  async findOne(id: number) {
    const paciente = await this.pacientesRepository.findOne({ where: { id } });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }
    return paciente;
  }

  // 5. Actualizar un paciente
  async update(id: number, input: UpdatePacienteInput) {
    const paciente = await this.pacientesRepository.preload({
      ...input, // Traemos todos los datos nuevos
      id: id,   // Aseguramos que el ID no se pierda
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }
    return this.pacientesRepository.save(paciente);
  }

  // 6. Eliminar un paciente
  async remove(id: number) {
    const paciente = await this.findOne(id);
    await this.pacientesRepository.remove(paciente);
    return paciente;
  }
}
