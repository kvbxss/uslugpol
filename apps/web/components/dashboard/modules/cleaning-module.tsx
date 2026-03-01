import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export function CleaningModule({ roleLabel }: { roleLabel: string }) {
  return (
    <Card id="cleaning-panel" className="bw-panel-card">
      <CardHeader className="bw-panel-header">
        <CardTitle>Modul Sprzatanie</CardTitle>
        <div className="bw-user-pill">{roleLabel}</div>
      </CardHeader>
      <CardContent className="bw-panel-content">
        <p className="muted">Integracja zostanie dodana w kolejnym kroku.</p>
      </CardContent>
    </Card>
  );
}
