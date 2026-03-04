import Link from "next/link";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

function mapLeadStatus(status: string) {
  if (status === "new") return "nowy";
  if (status === "qualified") return "zakwalifikowany";
  if (status === "converted") return "skonwertowany";
  return status;
}

function mapLeadStatusVariant(status: string) {
  if (status === "new") return "info" as const;
  if (status === "qualified") return "warning" as const;
  if (status === "converted") return "success" as const;
  return "neutral" as const;
}

function mapOpportunityStatus(status: string) {
  if (status === "open") return "otwarta";
  if (status === "accepted") return "zaakceptowana";
  if (status === "rejected") return "odrzucona";
  return status;
}

function mapOpportunityStatusVariant(status: string) {
  if (status === "open") return "warning" as const;
  if (status === "accepted") return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "neutral" as const;
}

function mapCategory(category: string) {
  if (category === "event") return "event";
  if (category === "car") return "transport";
  if (category === "cleaning") return "sprzatanie";
  return category;
}

function mapChannel(channel: string) {
  if (channel === "form") return "formularz";
  if (channel === "email") return "e-mail";
  if (channel === "phone") return "telefon";
  return channel;
}

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
  roleLabel,
  canCreateLead,
  canViewLeadDetails,
  stats,
  leads,
  opportunities,
}: {
  basePath: string;
  roleLabel: string;
  canCreateLead: boolean;
  canViewLeadDetails: boolean;
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
    <Card id="core-panel" className="bw-core-card bw-panel-core">
      <CardHeader className="bw-core-header">
        <CardTitle>Panel Core</CardTitle>
        <div className="bw-user-pill">{roleLabel}</div>
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
          {canCreateLead ? (
            <Link href={`${basePath}?addLead=1`}>
              <Button size="sm">+ Dodaj lead</Button>
            </Link>
          ) : (
            <Button size="sm" disabled>
              + Dodaj lead
            </Button>
          )}
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
                  <td>{mapCategory(lead.category)}</td>
                  <td>{mapChannel(lead.channel)}</td>
                  <td>{lead.location}</td>
                  <td>
                    <Badge variant={mapLeadStatusVariant(lead.status)}>
                      {mapLeadStatus(lead.status)}
                    </Badge>
                  </td>
                  <td>{lead.createdAtLabel}</td>
                  <td>
                    {canViewLeadDetails ? (
                      <Link className="link" href={`/leads/${lead.id}`}>
                        szczegoly
                      </Link>
                    ) : (
                      <span className="muted">brak dostepu</span>
                    )}
                  </td>
                </tr>
              ))}
              {!leads.length ? (
                <tr className="bw-table-empty">
                  <td colSpan={7}>Brak leadow do wyswietlenia.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <h3 className="bw-subtitle">Okazje cross-sell</h3>
        <div className="bw-table-wrap">
          <table className="bw-table">
            <thead>
              <tr>
                <th>ID leada</th>
                <th>Cel</th>
                <th>Powod</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((item) => (
                <tr key={item.id}>
                  <td>{item.leadId.slice(0, 6)}</td>
                  <td>{mapCategory(item.targetService)}</td>
                  <td>{item.reason}</td>
                  <td>
                    <Badge variant={mapOpportunityStatusVariant(item.status)}>
                      {mapOpportunityStatus(item.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
              {!opportunities.length ? (
                <tr className="bw-table-empty">
                  <td colSpan={4}>Brak okazji cross-sell.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
