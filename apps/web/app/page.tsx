import { DashboardPage } from "../components/dashboard/dashboard-page";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ addLead?: string; editEvent?: string; editCar?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;

  return (
    <DashboardPage
      isAddLeadOpen={params?.addLead === "1"}
      editEventId={params?.editEvent}
      editCarId={params?.editCar}
      basePath="/"
    />
  );
}
