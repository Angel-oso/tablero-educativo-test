import { EducationalDashboard } from "@/components/dashboard/educational-dashboard";
import { getStudentRecords } from "@/lib/student-data";

export default function Home() {
  const records = getStudentRecords();

  return <EducationalDashboard records={records} />;
}
