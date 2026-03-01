import { DashboardPage } from "../components/dashboard/dashboard-page";
import { requirePagePermission } from "@/lib/auth/clerk-auth";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ addLead?: string; editEvent?: string; editCar?: string }>;
}) {
  const authContext = await requirePagePermission("dashboard.view", "/");
  const params = searchParams ? await searchParams : undefined;

  return (
    <DashboardPage
      authContext={authContext}
      isAddLeadOpen={params?.addLead === "1"}
      editEventId={params?.editEvent}
      editCarId={params?.editCar}
      basePath="/"
    />
  );
}
