import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export function CleaningModule() {
  return (
    <Card id="cleaning-panel" className="bw-panel-card">
      <CardHeader className="bw-panel-header">
        <CardTitle>Modul Sprzatanie</CardTitle>
        <div className="bw-user-pill">Administrator</div>
      </CardHeader>
      <CardContent className="bw-panel-content">
        <p className="muted">Integracja zostanie dodana w kolejnym kroku.</p>
      </CardContent>
    </Card>
  );
}
