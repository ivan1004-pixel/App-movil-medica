import { gql } from '@apollo/client';

// 1. La Mutación para CREAR un paciente (Enviando tus 16 campos)
export const CREATE_PACIENTE = gql`
mutation CreatePaciente($input: CreatePacienteInput!) {
    createPaciente(input: $input) {
        id
        nombre
        apellido
    }
}
`;

// 2. La Query para LEER todos los pacientes (Para tu lista)
export const GET_PACIENTES = gql`
query GetPacientes {
    pacientes {
        id
        nombre
        apellido
        correo
        telefono
        tipo_sangre
    }
}
`;

// 3. La Query secreta: Buscar por nombre (¡Para lucirte!)
export const GET_PACIENTES_POR_NOMBRE = gql`
query GetPacientesPorNombre($nombre: String!) {
    pacientesPorNombre(nombre: $nombre) {
        id
        nombre
        apellido
        telefono
    }
}
`;

// 4. La Mutación para ELIMINAR
export const REMOVE_PACIENTE = gql`
mutation RemovePaciente($id: Int!) {
    removePaciente(id: $id) {
        id
        nombre
    }
}
`;
