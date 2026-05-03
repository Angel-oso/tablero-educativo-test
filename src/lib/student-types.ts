export type StudentRecord = {
  ID_Estudiante: number;
  Grado: number;
  Edad: number;
  Genero: "Masculino" | "Femenino";
  Tipo_Escuela: "Pública" | "Privada";
  Ubicacion_Escuela: "Urbana" | "Rural";
  Promedio_Calificaciones: number;
  Asistencia: number;
  Participacion_Extraescolares: "Sí" | "No";
  Acceso_Internet: "Sí" | "No";
};
