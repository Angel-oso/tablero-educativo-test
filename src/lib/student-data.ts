import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { read, utils } from "xlsx";

import type { StudentRecord } from "@/lib/student-types";

type RawStudentRow = Record<keyof StudentRecord, string | number>;

const workbookPath = path.join(
  process.cwd(),
  "src",
  "data",
  "actividad-colaborativa.xlsx"
);

function asNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function asLiteral<T extends string>(value: string | number): T {
  return String(value).trim() as T;
}

export const getStudentRecords = cache((): StudentRecord[] => {
  const workbookBuffer = readFileSync(workbookPath);
  const workbook = read(workbookBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<RawStudentRow>(sheet, { defval: "" });

  return rows.map((row) => ({
    ID_Estudiante: asNumber(row.ID_Estudiante),
    Grado: asNumber(row.Grado),
    Edad: asNumber(row.Edad),
    Genero: asLiteral<StudentRecord["Genero"]>(row.Genero),
    Tipo_Escuela: asLiteral<StudentRecord["Tipo_Escuela"]>(row.Tipo_Escuela),
    Ubicacion_Escuela: asLiteral<StudentRecord["Ubicacion_Escuela"]>(
      row.Ubicacion_Escuela
    ),
    Promedio_Calificaciones: asNumber(row.Promedio_Calificaciones),
    Asistencia: asNumber(row.Asistencia),
    Participacion_Extraescolares: asLiteral<
      StudentRecord["Participacion_Extraescolares"]
    >(row.Participacion_Extraescolares),
    Acceso_Internet: asLiteral<StudentRecord["Acceso_Internet"]>(
      row.Acceso_Internet
    ),
  }));
});
