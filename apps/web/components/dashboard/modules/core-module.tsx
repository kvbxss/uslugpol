import Link from "next/link";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

type LeadRow = {
  id: string;
  category: string;
  channel: string;
  location: string;
  status: string;
  createdAtLabel: string;
};

type OpportunityRow = {
  id: string;
  leadId: string;
  targetService: string;
  reason: string;
  status: string;
};

export function CoreModule({
  basePath,
  stats,
  leads,
  opportunities,
}: {
  basePath: string;
  stats: {
    newCount: number;
    qualifiedCount: number;
    convertedCount: number;
    opportunitiesToday: number;
  };
  leads: LeadRow[];
  opportunities: OpportunityRow[];
}) {
  return (
    <Card id="core-panel" className="bw-core-card">
      <CardHeader className="bw-core-header">
        <CardTitle>Core Dashboard</CardTitle>
        <div className="bw-user-pill">Admin</div>
      </CardHeader>
      <CardContent className="bw-core-content">
        <div className="bw-stats">
          <div className="bw-stat bw-stat-blue">
            <span>Nowe leady</span>
            <strong>{stats.newCount}</strong>
          </div>
          <div className="bw-stat bw-stat-green">
            <span>Leady zakwalifikowane</span>
            <strong>{stats.qualifiedCount}</strong>
          </div>
          <div className="bw-stat bw-stat-red">
            <span>Leady skonwertowane</span>
            <strong>{stats.convertedCount}</strong>
          </div>
          <div className="bw-stat bw-stat-indigo">
            <span>Okazje dzisiaj</span>
            <strong>{stats.opportunitiesToday}</strong>
          </div>
        </div>

        <div className="bw-section-header">
          <h3>Leady</h3>
          <Link href={`${basePath}?addLead=1`}>
            <Button size="sm">+ Dodaj lead</Button>
          </Link>
        </div>
        <div className="bw-table-wrap">
          <table className="bw-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kategoria</th>
                <th>Kanal</th>
                <th>Lokalizacja</th>
                <th>Status</th>
                <th>Utworzono</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.id.slice(0, 6)}</td>
                  <td>{lead.category}</td>
                  <td>{lead.channel}</td>
                  <td>{lead.location}</td>
                  <td>
                    <Badge>{lead.status}</Badge>
                  </td>
                  <td>{lead.createdAtLabel}</td>
                  <td>
                    <Link className="link" href={`/leads/${lead.id}`}>
                      szczegoly
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="bw-subtitle">Okazje Cross-sell</h3>
        <div className="bw-table-wrap">
          <table className="bw-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Cel</th>
                <th>Powod</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((item) => (
                <tr key={item.id}>
                  <td>{item.leadId.slice(0, 6)}</td>
                  <td>{item.targetService}</td>
                  <td>{item.reason}</td>
                  <td>
                    <Badge>{item.status}</Badge>
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
