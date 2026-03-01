import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <main className="dashboard-shell">
      <Card>
        <CardHeader>
          <CardTitle>Brak dostepu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="muted">
            Twoja rola nie ma uprawnien do tej akcji lub widoku.
          </p>
          <Link href="/">
            <Button className="mt-4" size="sm">
              Powrot do dashboardu
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
