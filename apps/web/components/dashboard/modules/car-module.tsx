import Link from "next/link";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

function mapOpportunityStatus(status: string) {
  if (status === "open") return "otwarta";
  if (status === "accepted") return "zaakceptowana";
  if (status === "rejected") return "odrzucona";
  return status;
}

type CarLeadRow = {
  id: string;
  leadId: string;
  passengers: number | null;
  pickupLocation: string | null;
};

type CarOpportunityRow = {
  id: string;
  leadId: string;
  reason: string;
  status: string;
};

export function CarModule({
  basePath,
  carLeads,
  carOpportunities,
  decideOpportunityAction,
}: {
  basePath: string;
  carLeads: CarLeadRow[];
  carOpportunities: CarOpportunityRow[];
  decideOpportunityAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card id="car-panel" className="bw-panel-card">
      <CardHeader className="bw-panel-header">
        <CardTitle>Modul Transport</CardTitle>
        <div className="bw-user-pill">Administrator</div>
      </CardHeader>
      <CardContent className="bw-panel-content">
        <h3 className="bw-subtitle">Leady transportowe</h3>
        <div className="bw-table-wrap">
          <table className="bw-table">
            <thead>
              <tr>
                <th>ID leada</th>
                <th>Liczba osob</th>
                <th>Miejsce odbioru</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {carLeads.slice(0, 6).map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.leadId.slice(0, 6)}</td>
                  <td>{lead.passengers ?? "-"}</td>
                  <td>{lead.pickupLocation ?? "-"}</td>
                  <td>
                    <Link href={`${basePath}?editCar=${lead.id}`}>
                      <Button size="sm" variant="outline" type="button">
                        Edytuj
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {!carLeads.length ? (
                <tr>
                  <td colSpan={4}>Brak leadow car.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <h3 className="bw-subtitle">Okazje dla transportu</h3>
        <div className="bw-table-wrap">
          <table className="bw-table">
            <thead>
              <tr>
                <th>ID leada</th>
                <th>Powod</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {carOpportunities.slice(0, 8).map((item) => (
                <tr key={item.id}>
                  <td>{item.leadId.slice(0, 6)}</td>
                  <td>{item.reason}</td>
                  <td>
                    {item.status === "open" ? (
                      <form action={decideOpportunityAction} className="bw-actions">
                        <input type="hidden" name="opportunityId" value={item.id} />
                        <input type="hidden" name="returnPath" value={basePath} />
                        <Button size="sm" type="submit" name="decision" value="accepted">
                          Akceptuj
                        </Button>
                        <Button size="sm" variant="outline" type="submit" name="decision" value="rejected">
                          Odrzuc
                        </Button>
                      </form>
                    ) : (
                      <Badge>{mapOpportunityStatus(item.status)}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
