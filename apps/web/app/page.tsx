import { DashboardPage } from "../components/dashboard/dashboard-page";
import { requirePagePermission } from "@/lib/auth/clerk-auth";

type HomeSearchParams = {
  addLead?: string | string[];
  editEvent?: string | string[];
  editCar?: string | string[];
  q?: string | string[];
  focus?: string | string[];
  window?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>;
}) {
  const authContext = await requirePagePermission("dashboard.view", "/");
  const params = searchParams ? await searchParams : undefined;
  const addLead = firstValue(params?.addLead);
  const editEvent = firstValue(params?.editEvent);
  const editCar = firstValue(params?.editCar);
  const searchQuery = firstValue(params?.q);
  const moduleFocus = firstValue(params?.focus);
  const windowParam = firstValue(params?.window);

  return (
    <DashboardPage
      authContext={authContext}
      isAddLeadOpen={addLead === "1"}
      editEventId={editEvent}
      editCarId={editCar}
      searchQuery={searchQuery}
      moduleFocus={moduleFocus}
      windowParam={windowParam}
      basePath="/"
    />
  );
}
