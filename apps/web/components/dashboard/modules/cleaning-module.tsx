import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export function CleaningModule() {
  return (
    <Card id="cleaning-panel">
      <CardHeader className="bw-panel-header">
        <CardTitle>Cleaning Service</CardTitle>
        <div className="bw-user-pill">Admin</div>
      </CardHeader>
      <CardContent className="bw-panel-content">
        <p className="muted">
          Widok modulu cleaning jest placeholderem. Integracja zostanie dodana w kolejnym kroku.
        </p>
      </CardContent>
    </Card>
  );
}
