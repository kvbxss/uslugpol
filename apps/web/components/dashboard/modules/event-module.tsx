import Link from "next/link";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";

type EventLeadRow = {
  id: string;
  leadId: string;
};

export function EventModule({
  basePath,
  eventLeads,
  reportOpportunityAction,
}: {
  basePath: string;
  eventLeads: EventLeadRow[];
  reportOpportunityAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card id="event-panel">
      <CardHeader className="bw-panel-header">
        <CardTitle>Event Service</CardTitle>
        <div className="bw-user-pill">Admin</div>
      </CardHeader>
      <CardContent className="bw-panel-content">
        <h3 className="bw-subtitle">Event Leads</h3>
        <div className="bw-table-wrap">
          <table className="bw-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Status</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {eventLeads.slice(0, 5).map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.leadId.slice(0, 6)}</td>
                  <td>
                    <Badge>sukces</Badge>
                  </td>
                  <td>
                    <Link href={`${basePath}?editEvent=${lead.id}`}>
                      <Button size="sm" variant="outline" type="button">
                        Edytuj
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="bw-subtitle">Feedback cross-sell do Core</h3>
        <form action={reportOpportunityAction} className="bw-feedback-form">
          <input type="hidden" name="returnPath" value={basePath} />
          <label className="field">
            <span>Lead eventowy</span>
            <Select name="leadId" defaultValue={eventLeads[0]?.leadId ?? ""} required>
              {eventLeads.length ? (
                eventLeads.slice(0, 8).map((lead) => (
                  <option key={lead.id} value={lead.leadId}>
                    {lead.leadId.slice(0, 6)}
                  </option>
                ))
              ) : (
                <option value="">Brak leadow eventowych</option>
              )}
            </Select>
          </label>
          <label className="field">
            <span>Liczba osob do transportu</span>
            <Input name="passengers" placeholder="np. 20" defaultValue="20" />
          </label>
          <Button size="sm" type="submit" disabled={!eventLeads.length}>
            Zglos do Core
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
