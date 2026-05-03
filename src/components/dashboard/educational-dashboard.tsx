"use client";

import { useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  Building2,
  Filter,
  Globe,
  GraduationCap,
  Map,
  MoonStar,
  School,
  Target,
  TriangleAlert,
  Users,
  Wifi,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { StudentRecord } from "@/lib/student-types";

type LocationFilter = "Todas" | StudentRecord["Ubicacion_Escuela"];
type SchoolFilter = "Todas" | StudentRecord["Tipo_Escuela"];
type GradeComparisonMode = "school" | "location";
type GradeSeriesKey = "publica" | "privada" | "urbana" | "rural";
type GradeComparisonRow = {
  grado: string;
  privada: number | null;
  publica: number | null;
  rural: number | null;
  urbana: number | null;
};
type SchoolDistributionRow = {
  schoolType: StudentRecord["Tipo_Escuela"];
  label: string;
  estudiantes: number;
  fill: string;
  porcentaje: number;
};

const locationOptions: LocationFilter[] = ["Todas", "Urbana", "Rural"];
const schoolOptions: SchoolFilter[] = ["Todas", "Pública", "Privada"];
const gradeOrder = Array.from({ length: 11 }, (_, index) => index + 1);
const schoolOrder: StudentRecord["Tipo_Escuela"][] = ["Pública", "Privada"];
const locationOrder: StudentRecord["Ubicacion_Escuela"][] = ["Urbana", "Rural"];

const palette = {
  primary: "#1877f2",
  secondary: "#2d88ff",
  soft: "#dfe9f7",
  softDark: "#8ab4f8",
  gray: "#65676b",
  graySoft: "#bcc0c4",
  dark: "#1c1e21",
};

const numberFormatter = new Intl.NumberFormat("es-CO");
const oneDecimalFormatter = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const twoDecimalFormatter = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const distributionChartConfig = {
  estudiantes: {
    label: "Estudiantes",
    color: palette.primary,
  },
} satisfies ChartConfig;

const gradeChartConfig = {
  publica: {
    label: "IE publica",
    color: palette.primary,
  },
  privada: {
    label: "IE privada",
    color: palette.softDark,
  },
  urbana: {
    label: "Urbana",
    color: palette.secondary,
  },
  rural: {
    label: "Rural",
    color: palette.graySoft,
  },
} satisfies ChartConfig;

const performanceChartConfig = {
  promedio: {
    label: "Promedio académico",
    color: palette.primary,
  },
} satisfies ChartConfig;

const internetChartConfig = {
  conInternet: {
    label: "Con internet",
    color: palette.primary,
  },
  sinInternet: {
    label: "Sin internet",
    color: palette.graySoft,
  },
} satisfies ChartConfig;

const attendanceChartConfig = {
  asistencia: {
    label: "Asistencia",
    color: palette.secondary,
  },
  inasistencia: {
    label: "Inasistencia",
    color: palette.graySoft,
  },
} satisfies ChartConfig;

type InternetGapRow = {
  schoolType: StudentRecord["Tipo_Escuela"];
  label: string;
  conInternet: number;
  sinInternet: number;
};

type InternetSegmentShapeProps = {
  fill?: string;
  height?: number;
  payload?: InternetGapRow;
  width?: number;
  x?: number;
  y?: number;
};

const surfaceCardClass =
  "border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.08)]";

const airySurfaceCardClass =
  "border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.06)]";

const metricCardClass =
  "border-border bg-card shadow-none";

const titleClass = "font-heading text-2xl tracking-tight text-foreground";
const descriptionClass = "text-sm leading-6 text-muted-foreground";
const bodyTextClass = "text-sm leading-6 text-muted-foreground";
const labelClass =
  "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: [number, number, number, number]
) {
  const [topLeft, topRight, bottomRight, bottomLeft] = radius.map((value) =>
    Math.max(0, Math.min(value, width / 2, height / 2))
  ) as [number, number, number, number];

  return [
    `M${x + topLeft},${y}`,
    `H${x + width - topRight}`,
    topRight ? `Q${x + width},${y} ${x + width},${y + topRight}` : `L${x + width},${y}`,
    `V${y + height - bottomRight}`,
    bottomRight
      ? `Q${x + width},${y + height} ${x + width - bottomRight},${y + height}`
      : `L${x + width},${y + height}`,
    `H${x + bottomLeft}`,
    bottomLeft ? `Q${x},${y + height} ${x},${y + height - bottomLeft}` : `L${x},${y + height}`,
    `V${y + topLeft}`,
    topLeft ? `Q${x},${y} ${x + topLeft},${y}` : `L${x},${y}`,
    "Z",
  ].join(" ");
}

function InternetSegmentShape({
  fill = "#1877f2",
  height = 0,
  payload,
  width = 0,
  x = 0,
  y = 0,
  variant,
}: InternetSegmentShapeProps & {
  variant: "conInternet" | "sinInternet";
}) {
  if (!payload || width <= 0 || height <= 0) {
    return null;
  }

  const radius =
    variant === "conInternet"
      ? payload.sinInternet > 0
        ? ([10, 0, 0, 10] as [number, number, number, number])
        : ([10, 10, 10, 10] as [number, number, number, number])
      : payload.conInternet > 0
        ? ([0, 10, 10, 0] as [number, number, number, number])
        : ([10, 10, 10, 10] as [number, number, number, number]);

  return <path d={roundedRectPath(x, y, width, height, radius)} fill={fill} />;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return (value / total) * 100;
}

function formatCount(value: number) {
  return numberFormatter.format(value);
}

function formatOneDecimal(value: number) {
  return oneDecimalFormatter.format(value);
}

function formatTwoDecimals(value: number) {
  return twoDecimalFormatter.format(value);
}

function shortSchoolName(value: StudentRecord["Tipo_Escuela"]) {
  return value === "Pública" ? "IE pública" : "IE privada";
}

function contextLabel(
  locationFilter: LocationFilter,
  schoolFilter: SchoolFilter
) {
  const locationText =
    locationFilter === "Todas" ? "todas las ubicaciones" : `zona ${locationFilter.toLowerCase()}`;
  const schoolText =
    schoolFilter === "Todas"
      ? "todos los tipos de institución"
      : shortSchoolName(schoolFilter).toLowerCase();

  return `${locationText} y ${schoolText}`;
}

function compareMessage(values: { label: string; value: number }[], noun: string) {
  if (values.length < 2) {
    return `Con el filtro actual solo queda visible ${values[0]?.label.toLowerCase()}.`;
  }

  const sorted = [...values].sort((left, right) => right.value - left.value);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const gap = highest.value - lowest.value;

  return `${highest.label} lidera en ${noun} con una ventaja de ${formatOneDecimal(
    gap
  )} puntos frente a ${lowest.label.toLowerCase()}.`;
}

export function EducationalDashboard({
  records,
}: {
  records: StudentRecord[];
}) {
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("Todas");
  const [schoolFilter, setSchoolFilter] = useState<SchoolFilter>("Todas");
  const [gradeComparisonMode, setGradeComparisonMode] =
    useState<GradeComparisonMode>("school");
  const [isPending, startTransition] = useTransition();

  const filteredRecords = records.filter((record) => {
    const matchesLocation =
      locationFilter === "Todas" || record.Ubicacion_Escuela === locationFilter;
    const matchesSchool =
      schoolFilter === "Todas" || record.Tipo_Escuela === schoolFilter;

    return matchesLocation && matchesSchool;
  });

  const totalStudents = filteredRecords.length;
  const averageGrade = average(
    filteredRecords.map((record) => record.Promedio_Calificaciones)
  );
  const averageAttendance = average(
    filteredRecords.map((record) => record.Asistencia)
  );
  const withInternetCount = filteredRecords.filter(
    (record) => record.Acceso_Internet === "Sí"
  ).length;
  const lowAttendanceCount = filteredRecords.filter(
    (record) => record.Asistencia < 80
  ).length;

  const schoolDistribution = schoolOrder
    .map((schoolType) => {
      const count = filteredRecords.filter(
        (record) => record.Tipo_Escuela === schoolType
      ).length;

      return {
        schoolType,
        label: shortSchoolName(schoolType),
        estudiantes: count,
        fill: schoolType === "Pública" ? palette.primary : palette.softDark,
        porcentaje: Number(percentage(count, totalStudents).toFixed(1)),
      };
    })
    .filter((item): item is SchoolDistributionRow => item.estudiantes > 0);

  const gradeProfile = gradeOrder
    .map((grade) => {
      const gradeRecords = filteredRecords.filter((record) => record.Grado === grade);
      if (gradeRecords.length === 0) {
        return null;
      }

      return {
        grado: `${grade}°`,
        promedio: Number(average(gradeRecords.map((record) => record.Promedio_Calificaciones)).toFixed(2)),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const gradeComparisonScopeRecords =
    gradeComparisonMode === "school"
      ? records.filter(
        (record) =>
          locationFilter === "Todas" ||
          record.Ubicacion_Escuela === locationFilter
      )
      : records.filter(
        (record) =>
          schoolFilter === "Todas" || record.Tipo_Escuela === schoolFilter
      );

  const gradeComparisonData = gradeOrder
    .map((grade) => {
      const gradeRecords = gradeComparisonScopeRecords.filter(
        (record) => record.Grado === grade
      );
      if (gradeRecords.length === 0) {
        return null;
      }

      const publicRecords = gradeRecords.filter(
        (record) => record.Tipo_Escuela === "Pública"
      );
      const privateRecords = gradeRecords.filter(
        (record) => record.Tipo_Escuela === "Privada"
      );
      const urbanRecords = gradeRecords.filter(
        (record) => record.Ubicacion_Escuela === "Urbana"
      );
      const ruralRecords = gradeRecords.filter(
        (record) => record.Ubicacion_Escuela === "Rural"
      );

      return {
        grado: `${grade}°`,
        privada: privateRecords.length
          ? Number(
            average(
              privateRecords.map((record) => record.Promedio_Calificaciones)
            ).toFixed(2)
          )
          : null,
        publica: publicRecords.length
          ? Number(
            average(
              publicRecords.map((record) => record.Promedio_Calificaciones)
            ).toFixed(2)
          )
          : null,
        rural: ruralRecords.length
          ? Number(
            average(
              ruralRecords.map((record) => record.Promedio_Calificaciones)
            ).toFixed(2)
          )
          : null,
        urbana: urbanRecords.length
          ? Number(
            average(
              urbanRecords.map((record) => record.Promedio_Calificaciones)
            ).toFixed(2)
          )
          : null,
      };
    })
    .filter((item): item is GradeComparisonRow => item !== null);

  const activeGradeSeries =
    gradeComparisonMode === "school"
      ? [
        {
          color: palette.primary,
          key: "publica" as GradeSeriesKey,
          label: "IE publica",
        },
        {
          color: palette.softDark,
          dashed: true,
          key: "privada" as GradeSeriesKey,
          label: "IE privada",
        },
      ]
      : [
        {
          color: palette.secondary,
          key: "urbana" as GradeSeriesKey,
          label: "Urbana",
        },
        {
          color: palette.graySoft,
          dashed: true,
          key: "rural" as GradeSeriesKey,
          label: "Rural",
        },
      ];

  const gradeComparisonValues = gradeComparisonData.flatMap((row) =>
    activeGradeSeries.flatMap((series) => {
      const value = row[series.key];
      return typeof value === "number" ? [value] : [];
    })
  );

  const gradeChartDomain = (() => {
    if (gradeComparisonValues.length === 0) {
      return [6, 8] as [number, number];
    }

    const minValue = Math.min(...gradeComparisonValues);
    const maxValue = Math.max(...gradeComparisonValues);
    const lowerBound = Math.max(
      0,
      Math.floor((minValue - 0.15) * 10) / 10
    );
    const upperBound = Math.min(
      10,
      Math.ceil((maxValue + 0.15) * 10) / 10
    );

    if (lowerBound === upperBound) {
      return [
        Math.max(0, Number((lowerBound - 0.3).toFixed(1))),
        Math.min(10, Number((upperBound + 0.3).toFixed(1))),
      ] as [number, number];
    }

    return [lowerBound, upperBound] as [number, number];
  })();

  const gradeGapRows = gradeComparisonData
    .map((row) => {
      const [firstSeries, secondSeries] = activeGradeSeries;
      const firstValue = row[firstSeries.key];
      const secondValue = row[secondSeries.key];

      if (firstValue === null || secondValue === null) {
        return null;
      }

      const firstLeads = firstValue >= secondValue;

      return {
        gap: Number(Math.abs(firstValue - secondValue).toFixed(2)),
        grado: row.grado,
        leadingLabel: firstLeads ? firstSeries.label : secondSeries.label,
        leadingValue: firstLeads ? firstValue : secondValue,
        trailingLabel: firstLeads ? secondSeries.label : firstSeries.label,
        trailingValue: firstLeads ? secondValue : firstValue,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const largestGradeGap = [...gradeGapRows].sort(
    (left, right) => right.gap - left.gap
  )[0];

  const gradeComparisonScope =
    gradeComparisonMode === "school"
      ? locationFilter === "Todas"
        ? "en la vista actual"
        : `en la zona ${locationFilter.toLowerCase()}`
      : schoolFilter === "Todas"
        ? "en la vista actual"
        : `en ${shortSchoolName(schoolFilter).toLowerCase()}`;

  const gradeComparisonSummary = largestGradeGap
    ? `La mayor diferencia ${gradeComparisonMode === "school"
      ? "entre IE publica e IE privada"
      : "entre zona urbana y rural"
    } se observa en ${largestGradeGap.grado} ${gradeComparisonScope}: ${largestGradeGap.leadingLabel
    } registra ${formatTwoDecimals(
      largestGradeGap.leadingValue
    )} frente a ${formatTwoDecimals(
      largestGradeGap.trailingValue
    )} de ${largestGradeGap.trailingLabel.toLowerCase()}.`
    : gradeComparisonData.length > 0
      ? "Con la seleccion actual no coinciden ambos grupos en los mismos grados visibles, por lo que no se forma una brecha comparable."
      : "No hay suficientes datos para leer la trayectoria por grado.";

  const performanceGap = schoolOrder
    .map((schoolType) => {
      const schoolRecords = filteredRecords.filter(
        (record) => record.Tipo_Escuela === schoolType
      );
      if (schoolRecords.length === 0) {
        return null;
      }

      return {
        schoolType,
        label: shortSchoolName(schoolType),
        promedio: Number(
          average(schoolRecords.map((record) => record.Promedio_Calificaciones)).toFixed(2)
        ),
        fill: schoolType === "Pública" ? palette.primary : palette.gray,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const internetGap = schoolOrder
    .map((schoolType) => {
      const schoolRecords = filteredRecords.filter(
        (record) => record.Tipo_Escuela === schoolType
      );
      if (schoolRecords.length === 0) {
        return null;
      }

      const conInternet = schoolRecords.filter(
        (record) => record.Acceso_Internet === "Sí"
      ).length;

      return {
        schoolType,
        label: shortSchoolName(schoolType),
        conInternet: Number(percentage(conInternet, schoolRecords.length).toFixed(1)),
        sinInternet: Number(
          percentage(schoolRecords.length - conInternet, schoolRecords.length).toFixed(1)
        ),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const attendanceGap = locationOrder
    .map((location) => {
      const locationRecords = filteredRecords.filter(
        (record) => record.Ubicacion_Escuela === location
      );
      if (locationRecords.length === 0) {
        return null;
      }

      return {
        location,
        label: location,
        asistencia: Number(
          average(locationRecords.map((record) => record.Asistencia)).toFixed(2)
        ),
        inasistencia: Number(
          (
            100 -
            average(locationRecords.map((record) => record.Asistencia))
          ).toFixed(2)
        ),
        fill: location === "Urbana" ? palette.secondary : palette.graySoft,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const publicPerformance = performanceGap.find(
    (item) => item.schoolType === "Pública"
  );
  const privatePerformance = performanceGap.find(
    (item) => item.schoolType === "Privada"
  );
  const publicInternet = internetGap.find(
    (item) => item.schoolType === "Pública"
  );
  const privateInternet = internetGap.find(
    (item) => item.schoolType === "Privada"
  );
  const urbanAttendance = attendanceGap.find(
    (item) => item.location === "Urbana"
  );
  const ruralAttendance = attendanceGap.find(
    (item) => item.location === "Rural"
  );
  const noInternetInView = filteredRecords.filter(
    (record) => record.Acceso_Internet === "No"
  ).length;

  const performanceConclusion =
    publicPerformance && privatePerformance
      ? `La diferencia de rendimiento por tipo de escuela sigue siendo visible: ${privatePerformance.label} registra ${formatTwoDecimals(
        privatePerformance.promedio
      )} de promedio, frente a ${formatTwoDecimals(
        publicPerformance.promedio
      )} de ${publicPerformance.label.toLowerCase()}. La brecha observada es de ${formatTwoDecimals(
        Math.abs(privatePerformance.promedio - publicPerformance.promedio)
      )} puntos.`
      : performanceGap[0]
        ? `En la vista activa solo se observa ${performanceGap[0].label.toLowerCase()}, con un promedio de ${formatTwoDecimals(
          performanceGap[0].promedio
        )}.`
        : "No hay suficientes datos para establecer una lectura comparativa del rendimiento.";

  const internetConclusion =
    publicInternet && privateInternet
      ? `La conectividad no se distribuye de manera equivalente entre instituciones: ${formatOneDecimal(
        privateInternet.conInternet
      )} % de ${privateInternet.label.toLowerCase()} dispone de internet, mientras ${formatOneDecimal(
        publicInternet.sinInternet
      )} % de ${publicInternet.label.toLowerCase()} permanece sin conexión. En el recorte activo esto representa ${formatCount(
        noInternetInView
      )} estudiantes sin acceso en casa.`
      : internetGap[0]
        ? `En ${internetGap[0].label.toLowerCase()}, ${formatOneDecimal(
          internetGap[0].conInternet
        )} % dispone de internet y ${formatOneDecimal(
          internetGap[0].sinInternet
        )} % no cuenta con conexión en el hogar.`
        : "No hay suficientes datos para establecer una lectura comparativa de conectividad.";

  const attendanceConclusion =
    urbanAttendance && ruralAttendance
      ? `El territorio altera directamente la permanencia escolar: la zona urbana alcanza ${formatOneDecimal(
        urbanAttendance.asistencia
      )} % de asistencia y ${formatOneDecimal(
        urbanAttendance.inasistencia
      )} % de inasistencia, mientras la zona rural registra ${formatOneDecimal(
        ruralAttendance.asistencia
      )} % y ${formatOneDecimal(
        ruralAttendance.inasistencia
      )} %. La diferencia de asistencia es de ${formatOneDecimal(
        Math.abs(urbanAttendance.asistencia - ruralAttendance.asistencia)
      )} puntos.`
      : attendanceGap[0]
        ? `En la vista activa, ${attendanceGap[0].label.toLowerCase()} registra ${formatOneDecimal(
          attendanceGap[0].asistencia
        )} % de asistencia y ${formatOneDecimal(
          attendanceGap[0].inasistencia
        )} % de inasistencia.`
        : "No hay suficientes datos para establecer una lectura comparativa de asistencia.";

  const dominantSchool = [...schoolDistribution].sort(
    (left, right) => right.estudiantes - left.estudiantes
  )[0];
  const strongestGrade = [...gradeProfile].sort(
    (left, right) => right.promedio - left.promedio
  )[0];
  const weakestGrade = [...gradeProfile].sort(
    (left, right) => left.promedio - right.promedio
  )[0];

  const allNoInternet = records.filter(
    (record) => record.Acceso_Internet === "No"
  ).length;
  const allLowAttendance = records.filter(
    (record) => record.Asistencia < 80
  ).length;
  const allLowPerformance = records.filter(
    (record) => record.Promedio_Calificaciones < 6.5
  ).length;
  const publicAverage = average(
    records
      .filter((record) => record.Tipo_Escuela === "Pública")
      .map((record) => record.Promedio_Calificaciones)
  );
  const privateAverage = average(
    records
      .filter((record) => record.Tipo_Escuela === "Privada")
      .map((record) => record.Promedio_Calificaciones)
  );
  const fullGradeProfile = gradeOrder
    .map((grade) => {
      const gradeRecords = records.filter((record) => record.Grado === grade);
      if (gradeRecords.length === 0) {
        return null;
      }

      return {
        grado: `${grade}°`,
        promedio: Number(
          average(
            gradeRecords.map((record) => record.Promedio_Calificaciones)
          ).toFixed(2)
        ),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const strongestGradeOverall = [...fullGradeProfile].sort(
    (left, right) => right.promedio - left.promedio
  )[0];
  const weakestGradeOverall = [...fullGradeProfile].sort(
    (left, right) => left.promedio - right.promedio
  )[0];

  const decisionCards = [
    {
      title: "Rediseñar tareas que dependen de conexión",
      icon: Wifi,
      cross:
        "Cruces asociados: Tipo_Escuela × Acceso_Internet y Acceso_Internet × condiciones de realización de tareas.",
      hallazgo: `${formatCount(allNoInternet)} estudiantes (${formatOneDecimal(
        percentage(allNoInternet, records.length)
      )} %) no tienen internet en casa y todos pertenecen a IE públicas.`,
      decision:
        "Identificar nominalmente a ese grupo y mover la parte que requiere conexión al horario escolar: biblioteca, sala de informática o jornada extendida.",
      indicator:
        "Medir la tasa de entrega de tareas digitales antes y después del rediseño.",
      risk:
        "Depende de tener conectividad institucional y franjas horarias disponibles.",
    },
    {
      title: "Activar alerta temprana por ausentismo rural",
      icon: Map,
      cross:
        "Cruce asociado: Ubicacion_Escuela × Asistencia. Identificación de concentración territorial del ausentismo.",
      hallazgo: `${formatCount(allLowAttendance)} estudiantes tienen asistencia inferior al 80 % y la concentración está completamente en sedes rurales.`,
      decision:
        "Crear una alerta semanal para estudiantes por debajo de 75 % y activar contacto temprano con familias antes de que el ausentismo se vuelva crónico.",
      indicator:
        "Reducir la proporción de inasistencia en estudiantes rurales por debajo del 80 % durante un periodo académico.",
      risk:
        "Si la causa del ausentismo es estructural, la respuesta necesita apoyo institucional externo.",
    },
    {
      title: "Focalizar apoyo académico en la escuela pública",
      icon: GraduationCap,
      cross:
        "Cruce asociado: Tipo_Escuela × Promedio_Calificaciones. Comparación directa del desempeño medio por tipo de institución.",
      hallazgo: `${formatCount(allLowPerformance)} estudiantes tienen promedio inferior a 6.5 y todos están matriculados en IE públicas.`,
      decision:
        "Priorizar tutorías, seguimiento por curso y revisión de evaluación formativa en los grupos públicos con más estudiantes por debajo del umbral.",
      indicator:
        "Subir el promedio del grupo focal y reducir el número de estudiantes bajo 6.5 en el siguiente corte.",
      risk:
        "La medida puede perder sostenibilidad si no se revisan de manera simultánea los criterios de evaluación, el acompañamiento pedagógico y las condiciones de aprendizaje del grupo.",
    },
    {
      title: "Priorizar apoyo en los grados con mayor rezago",
      icon: Target,
      cross:
        "Cruce asociado: Grado × Promedio_Calificaciones. Identificación de momentos de descenso en la trayectoria académica.",
      hallazgo:
        strongestGradeOverall && weakestGradeOverall
          ? `En la base completa, ${strongestGradeOverall.grado} registra el promedio más alto (${formatTwoDecimals(
            strongestGradeOverall.promedio
          )}) y ${weakestGradeOverall.grado} el más bajo (${formatTwoDecimals(
            weakestGradeOverall.promedio
          )}), con una diferencia de ${formatTwoDecimals(
            strongestGradeOverall.promedio - weakestGradeOverall.promedio
          )} puntos.`
          : "No hay suficientes datos para establecer una lectura comparativa por grado.",
      decision:
        weakestGradeOverall
          ? `Priorizar acompañamiento académico, seguimiento tutorial y revisión de cargas evaluativas en los grados donde el promedio cae, con énfasis inicial en ${weakestGradeOverall.grado}.`
          : "Priorizar acompañamiento académico y revisión de la trayectoria por grado en los cursos con menor desempeño.",
      indicator:
        "Reducir la distancia entre el grado con menor promedio y el promedio general en el siguiente corte académico.",
      risk:
        "Si no se distinguen las causas del rezago por grado, la intervención puede quedarse en refuerzo general y no corregir el punto crítico de la trayectoria.",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="rounded-full border-border bg-card px-3 py-1 text-muted-foreground"
                variant="outline"
              >
                Actividad colaborativa I
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-xl tracking-tight text-foreground sm:text-2xl">
                Tablero de brechas educativas
              </p>
              <p className="text-sm text-muted-foreground">
                300 estudiantes · EDA institucional · filtros interactivos y
                decisiones trazables al dato.
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                Autores: Julian Danilo Castro Garcia, Angela Lucia Hurtado
                Hermosa, Angel David Osorio Negrete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground sm:flex">
              <MoonStar className="size-4" />
              Tema
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-4 xl:grid-cols-[1.8fr_1.2fr]">
          <Card className="border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            <CardHeader className="gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  Módulo: Información en el sistema educativo
                </Badge>
                <Badge variant="secondary">
                  Fuente: Excel embebido
                </Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="font-heading text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                  ¿Cómo cambian el rendimiento y la asistencia según el contexto escolar?
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Tablero analítico para examinar resultados académicos,
                  asistencia y acceso a internet en la muestra estudiada.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 pb-8 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/55 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4 text-[#1877f2]" />
                  Total de estudiantes
                </div>
                <p className="text-3xl font-semibold text-foreground">{formatCount(records.length)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Base simulada analizada.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/55 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="size-4 text-[#1877f2]" />
                  Brecha de promedio
                </div>
                <p className="text-3xl font-semibold text-foreground">
                  {formatTwoDecimals(privateAverage - publicAverage)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Diferencia media entre IE pública y privada.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/55 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Map className="size-4 text-[#1877f2]" />
                  Asistencia crítica
                </div>
                <p className="text-3xl font-semibold text-foreground">{formatCount(allLowAttendance)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Registros con asistencia inferior al 80 %.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={airySurfaceCardClass}>
            <CardHeader className="pb-4">
              <CardTitle className={cn("flex items-center gap-2", titleClass)}>
                <Filter className="size-5 text-muted-foreground" />
                Filtros de lectura
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Aplicación transversal sobre los cruces principales. Permiten
                reexpresar las brechas por ubicación y tipo de institución.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className={labelClass}>
                  Ubicación de la sede
                </p>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={locationFilter === option ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-4 shadow-none",
                        locationFilter === option &&
                        "bg-[#1877f2] text-white hover:bg-[#166fe5] dark:bg-[#2d88ff] dark:text-white dark:hover:bg-[#1b74e4]"
                      )}
                      onClick={() =>
                        startTransition(() => {
                          setLocationFilter(option);
                        })
                      }
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className={labelClass}>
                  Tipo de institución
                </p>
                <div className="flex flex-wrap gap-2">
                  {schoolOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={schoolFilter === option ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-4 shadow-none",
                        schoolFilter === option &&
                        "bg-[#1877f2] text-white hover:bg-[#166fe5] dark:bg-[#2d88ff] dark:text-white dark:hover:bg-[#1b74e4]"
                      )}
                      onClick={() =>
                        startTransition(() => {
                          setSchoolFilter(option);
                        })
                      }
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/55 p-4 text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Vista activa
                </p>
                <p>
                  Estás mirando {contextLabel(locationFilter, schoolFilter)}.
                  {isPending ? " Actualizando métricas..." : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className={airySurfaceCardClass}>
            <CardHeader>
              <CardTitle className={titleClass}>
                Panorama general
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Vista general del subconjunto filtrado. Resume volumen,
                promedio, asistencia, conectividad y criticidad de asistencia
                antes del análisis bivariado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                {
                  label: "Estudiantes en la vista",
                  value: formatCount(totalStudents),
                  note: "Registros según filtros aplicados",
                  icon: Users,
                },
                {
                  label: "Promedio de calificaciones",
                  value: formatTwoDecimals(averageGrade),
                  note: "Escala de 0 a 10",
                  icon: GraduationCap,
                },
                {
                  label: "Asistencia media",
                  value: `${formatOneDecimal(averageAttendance)} %`,
                  note: "Porcentaje promedio",
                  icon: BookOpen,
                },
                {
                  label: "Acceso a internet",
                  value: `${formatOneDecimal(
                    percentage(withInternetCount, totalStudents)
                  )} %`,
                  note: "Porcentaje con acceso en el hogar",
                  icon: Globe,
                },
                {
                  label: "Asistencia inferior al 80 %",
                  value: formatCount(lowAttendanceCount),
                  note: "Conteo de estudiantes",
                  icon: TriangleAlert,
                },
              ].map((item) => (
                <Card
                  key={item.label}
                  className={metricCardClass}
                >
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.label}
                      </p>
                      <item.icon className="size-4 text-[#1877f2]" />
                    </div>
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {item.note}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className={surfaceCardClass}>
            <CardHeader>
              <CardTitle className={titleClass}>
                Composición de la muestra
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Distribución simple de Tipo_Escuela. Contextualiza el peso
                relativo de la matrícula visible antes de los cruces
                explicativos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChartContainer
                className="h-[280px] w-full"
                config={distributionChartConfig}
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, _name, _item, _index, payload) => {
                          const row = payload as unknown as SchoolDistributionRow;
                          const count =
                            typeof value === "number" ? value : Number(value);

                          return (
                            <div className="flex min-w-40 items-center justify-between gap-4">
                              <span className="text-muted-foreground">
                                {row.label}
                              </span>
                              <span className="font-mono font-medium text-foreground tabular-nums">
                                {`${formatCount(count)} · ${formatOneDecimal(
                                  row.porcentaje
                                )} %`}
                              </span>
                            </div>
                          );
                        }}
                        hideIndicator
                        hideLabel
                      />
                    }
                  />
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={schoolDistribution}
                    dataKey="estudiantes"
                    label={({ percent }) =>
                      percent ? `${Math.round(percent * 100)} %` : ""
                    }
                    labelLine={false}
                    nameKey="label"
                    outerRadius={98}
                    paddingAngle={0}
                    stroke="none"
                  >
                    {schoolDistribution.map((item) => (
                      <Cell key={item.schoolType} fill={item.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="grid gap-2 sm:grid-cols-2">
                {schoolDistribution.map((item) => (
                  <div
                    key={`${item.schoolType}-legend`}
                    className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {`${formatCount(item.estudiantes)} · ${formatOneDecimal(
                        item.porcentaje
                      )} %`}
                    </span>
                  </div>
                ))}
              </div>
              <p className={bodyTextClass}>
                {dominantSchool
                  ? `${dominantSchool.label} representa ${formatOneDecimal(
                    percentage(dominantSchool.estudiantes, totalStudents)
                  )} % de la vista actual. Esto importa porque el tablero no está leyendo una población homogénea, sino una muestra donde la matrícula pública pesa más y condiciona la interpretación de las brechas.`
                  : "No hay datos visibles con la combinación actual de filtros."}
              </p>
            </CardContent>
          </Card>

          <Card className={surfaceCardClass}>
            <CardHeader>
              <CardTitle className={titleClass}>
                Ritmo académico por grado
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Cruce: Grado x Promedio_Calificaciones, segmentado por
                Tipo_Escuela o Ubicacion_Escuela. Conserva el filtro
                complementario para comparar grupos dentro de la misma
                trayectoria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    gradeComparisonMode === "school" ? "default" : "outline"
                  }
                  className={cn(
                    "rounded-full px-4 shadow-none",
                    gradeComparisonMode === "school" &&
                    "bg-[#1877f2] text-white hover:bg-[#166fe5] dark:bg-[#2d88ff] dark:text-white dark:hover:bg-[#1b74e4]"
                  )}
                  onClick={() => setGradeComparisonMode("school")}
                >
                  IE publica vs privada
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    gradeComparisonMode === "location" ? "default" : "outline"
                  }
                  className={cn(
                    "rounded-full px-4 shadow-none",
                    gradeComparisonMode === "location" &&
                    "bg-[#1877f2] text-white hover:bg-[#166fe5] dark:bg-[#2d88ff] dark:text-white dark:hover:bg-[#1b74e4]"
                  )}
                  onClick={() => setGradeComparisonMode("location")}
                >
                  Urbana vs rural
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {activeGradeSeries.map((series) => (
                  <div key={series.key} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: series.color }}
                    />
                    <span>{series.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                La comparacion por tipo de escuela mantiene el filtro de
                ubicacion. La comparacion por ubicacion mantiene el filtro de
                escuela.
              </p>
              <ChartContainer className="h-[280px] w-full" config={gradeChartConfig}>
                <LineChart data={gradeComparisonData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="grado"
                    tickLine={false}
                    tickMargin={12}
                  />
                  <YAxis
                    axisLine={false}
                    domain={gradeChartDomain}
                    tickFormatter={(value) => formatOneDecimal(Number(value))}
                    tickLine={false}
                    tickMargin={12}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey="grado" />}
                  />
                  {activeGradeSeries.map((series) => (
                    <Line
                      key={series.key}
                      activeDot={{ r: 5 }}
                      connectNulls
                      dataKey={series.key}
                      dot={{ fill: series.color, r: 3, strokeWidth: 0 }}
                      name={series.label}
                      stroke={series.color}
                      strokeDasharray={series.dashed ? "6 4" : undefined}
                      strokeWidth={2.5}
                      type="monotone"
                    />
                  ))}
                </LineChart>
              </ChartContainer>
              <p className={bodyTextClass}>
                {gradeComparisonSummary}{" "}
                {strongestGrade && weakestGrade
                  ? `En la lectura agregada por grado, el valor mas alto se mantiene en ${strongestGrade.grado} (${formatTwoDecimals(
                    strongestGrade.promedio
                  )}) y el mas bajo en ${weakestGrade.grado} (${formatTwoDecimals(
                    weakestGrade.promedio
                  )}).`
                  : ""}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className={surfaceCardClass}>
            <CardHeader>
              <CardTitle className={titleClass}>
                Brecha de rendimiento por tipo de escuela
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Cruce: Tipo_Escuela × Promedio_Calificaciones. Compara el
                promedio académico entre IE pública e IE privada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChartContainer
                className="h-[280px] w-full"
                config={performanceChartConfig}
              >
                <BarChart data={performanceGap} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    tickLine={false}
                    tickMargin={12}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[6, 9]}
                    tickFormatter={(value) => formatOneDecimal(Number(value))}
                    tickLine={false}
                    tickMargin={12}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey="label" />}
                  />
                  <Bar dataKey="promedio" radius={[12, 12, 0, 0]}>
                    {performanceGap.map((item) => (
                      <Cell key={item.schoolType} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <p className={bodyTextClass}>
                {compareMessage(
                  performanceGap.map((item) => ({
                    label: item.label,
                    value: item.promedio,
                  })),
                  "promedio académico"
                )}{" "}
                En la base completa, esta es la diferencia más grande y por eso
                conviene convertirla en una conversación institucional, no solo en
                una lectura descriptiva del gráfico.
              </p>
            </CardContent>
          </Card>

          <Card className={surfaceCardClass}>
            <CardHeader>
              <CardTitle className={titleClass}>
                Brecha digital por tipo de escuela
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Cruce: Tipo_Escuela × Acceso_Internet. Mide la proporción de
                estudiantes con y sin conectividad en cada tipo de institución.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#1877f2]" />
                  <span>Con internet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#bcc0c4]" />
                  <span>Sin internet</span>
                </div>
              </div>
              <ChartContainer className="h-[240px] w-full" config={internetChartConfig}>
                <BarChart
                  data={internetGap}
                  layout="vertical"
                  margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${Number(value)} %`}
                    tickLine={false}
                    tickMargin={12}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    dataKey="label"
                    tickLine={false}
                    tickMargin={12}
                    type="category"
                    width={88}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey="label" />}
                  />
                  <Bar
                    barSize={30}
                    dataKey="conInternet"
                    fill={palette.primary}
                    shape={(props) => (
                      <InternetSegmentShape
                        {...props}
                        variant="conInternet"
                      />
                    )}
                    stackId="internet"
                  >
                    {internetGap.map((item) => (
                      <Cell
                        key={`${item.schoolType}-internet-si`}
                        fill={palette.primary}
                      />
                    ))}
                  </Bar>
                  <Bar
                    barSize={30}
                    dataKey="sinInternet"
                    fill={palette.graySoft}
                    shape={(props) => (
                      <InternetSegmentShape
                        {...props}
                        variant="sinInternet"
                      />
                    )}
                    stackId="internet"
                  >
                    {internetGap.map((item) => (
                      <Cell
                        key={`${item.schoolType}-internet-no`}
                        fill={palette.graySoft}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <p className={bodyTextClass}>
                {filteredRecords.length > 0
                  ? `${formatCount(
                    filteredRecords.filter(
                      (record) => record.Acceso_Internet === "No"
                    ).length
                  )} estudiantes del recorte actual están sin internet en casa. La pregunta útil no es solo cuántos son, sino qué parte de la experiencia escolar sigue suponiendo conectividad como si fuera universal.`
                  : "No hay datos visibles con la combinación actual de filtros."}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className={surfaceCardClass}>
            <CardHeader>
              <CardTitle className={titleClass}>
                Asistencia y territorio
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Cruce: Ubicacion_Escuela x Asistencia. Contrasta la asistencia
                media y su inasistencia complementaria entre zona urbana y
                rural.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#2d88ff]" />
                  <span>Asistencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#bcc0c4]" />
                  <span>Inasistencia</span>
                </div>
              </div>
              <ChartContainer
                className="h-[280px] w-full"
                config={attendanceChartConfig}
              >
                <BarChart data={attendanceGap} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    tickLine={false}
                    tickMargin={12}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${Number(value)} %`}
                    tickLine={false}
                    tickMargin={12}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey="label" />}
                  />
                  <Bar
                    dataKey="asistencia"
                    fill={palette.secondary}
                    maxBarSize={42}
                    radius={[12, 12, 0, 0]}
                  />
                  <Bar
                    dataKey="inasistencia"
                    fill={palette.graySoft}
                    maxBarSize={42}
                    radius={[12, 12, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
              <p className={bodyTextClass}>
                {compareMessage(
                  attendanceGap.map((item) => ({
                    label: item.label,
                    value: item.asistencia,
                  })),
                  "asistencia"
                )}{" "}
                La lectura conjunta con la inasistencia muestra que el costo de
                la brecha territorial se concentra en la permanencia escolar,
                no solo en la conectividad.
              </p>
            </CardContent>
          </Card>

          <Card className={surfaceCardClass}>
            <CardHeader>
              <CardTitle className={titleClass}>
                Lectura rápida de la vista activa
              </CardTitle>
              <CardDescription className={descriptionClass}>
                Síntesis interpretativa de los cruces principales. Resume la
                segmentación observada por escuela, territorio y conectividad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <div className="rounded-2xl border border-border bg-muted/55 p-4">
                <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <School className="size-4 text-[#1877f2]" />
                  Brecha académica
                </p>
                <p>{performanceConclusion}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/55 p-4">
                <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <Wifi className="size-4 text-[#1877f2]" />
                  Brecha digital
                </p>
                <p>{internetConclusion}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/55 p-4">
                <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <Map className="size-4 text-[#1877f2]" />
                  Brecha territorial
                </p>
                <p>{attendanceConclusion}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <Badge className="rounded-full px-3 py-1" variant="outline">
              Sección final de hallazgos y decisiones
            </Badge>
            <h2 className="font-heading text-3xl tracking-tight text-foreground">
              Del gráfico a la acción
            </h2>
            <p className="max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">
              Esta sección presenta hallazgos y decisiones sustentados en la
              base completa, con el fin de conservar trazabilidad analítica y
              orientar la lectura hacia acciones concretas.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {decisionCards.map((card) => (
              <Card
                key={card.title}
                className="border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className="mb-3 rounded-full px-3 py-1" variant="secondary">
                        Base completa
                      </Badge>
                      <CardTitle className={titleClass}>
                        {card.title}
                      </CardTitle>
                      <CardDescription className={cn(descriptionClass, "mt-2 max-w-xl")}>
                        {card.cross}
                      </CardDescription>
                    </div>
                    <div className="rounded-2xl bg-[#1877f2] p-3 text-white">
                      <card.icon className="size-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                  <div>
                    <p className={labelClass}>
                      Hallazgo
                    </p>
                    <p>{card.hallazgo}</p>
                  </div>
                  <div>
                    <p className={labelClass}>
                      Decisión propuesta
                    </p>
                    <p>{card.decision}</p>
                  </div>
                  <div>
                    <p className={labelClass}>
                      Indicador de seguimiento
                    </p>
                    <p>{card.indicator}</p>
                  </div>
                  <div>
                    <p className={labelClass}>
                      Riesgo o supuesto
                    </p>
                    <p>{card.risk}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
