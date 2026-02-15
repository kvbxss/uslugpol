import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

type FormAction = (formData: FormData) => Promise<void>;

type EventLeadForEdit = {
  id: string;
  eventDate: string | null;
  location: string | null;
  eventType: string | null;
  guestCount: number | null;
  budget: string | null;
};

type CarLeadForEdit = {
  id: string;
  vehicleType: string | null;
  passengers: number | null;
  distanceKm: number | null;
  pickupLocation: string | null;
};

export function AddLeadModal({
  basePath,
  createLeadAction,
}: {
  basePath: string;
  createLeadAction: FormAction;
}) {
  return (
    <Card className="bw-modal-card">
      <CardHeader>
        <CardTitle>Dodaj lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createLeadAction} className="lead-form">
          <input type="hidden" name="returnPath" value={basePath} />
          <label className="field">
            <span>Kanal</span>
            <Select name="channel" defaultValue="form">
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kanal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form">formularz</SelectItem>
                <SelectItem value="email">e-mail</SelectItem>
                <SelectItem value="phone">telefon</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="field">
            <span>Kategoria</span>
            <Select name="category" defaultValue="event">
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">event</SelectItem>
                <SelectItem value="car">transport</SelectItem>
                <SelectItem value="cleaning">sprzatanie</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="field">
            <span>Lokalizacja</span>
            <Input name="location" defaultValue="Krakow" />
          </label>
          <label className="field">
            <span>Opis</span>
            <Textarea
              name="description"
              defaultValue="Impreza firmowa w Krakowie"
            />
          </label>
          <div className="bw-modal-actions">
            <Link href={basePath}>
              <Button type="button" variant="outline">
                Anuluj
              </Button>
            </Link>
            <Button type="submit">Utworz lead</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function EditEventLeadModal({
  basePath,
  eventLead,
  updateEventLeadAction,
}: {
  basePath: string;
  eventLead: EventLeadForEdit;
  updateEventLeadAction: FormAction;
}) {
  return (
    <Card className="bw-modal-card">
      <CardHeader>
        <CardTitle>Edytuj lead eventowy</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateEventLeadAction} className="lead-form">
          <input type="hidden" name="id" value={eventLead.id} />
          <input type="hidden" name="returnPath" value={basePath} />
          <label className="field">
            <span>Data eventu</span>
            <Input type="date" name="eventDate" defaultValue={eventLead.eventDate ?? ""} />
          </label>
          <label className="field">
            <span>Lokalizacja eventu</span>
            <Input name="location" defaultValue={eventLead.location ?? ""} />
          </label>
          <label className="field">
            <span>Typ eventu</span>
            <Input name="eventType" defaultValue={eventLead.eventType ?? ""} />
          </label>
          <label className="field">
            <span>Liczba gosci</span>
            <Input type="number" name="guestCount" defaultValue={eventLead.guestCount ?? ""} />
          </label>
          <label className="field">
            <span>Budzet</span>
            <Input type="number" step="0.01" name="budget" defaultValue={eventLead.budget ?? ""} />
          </label>
          <div className="bw-modal-actions">
            <Link href={basePath}>
              <Button type="button" variant="outline">
                Anuluj
              </Button>
            </Link>
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function EditCarLeadModal({
  basePath,
  carLead,
  updateCarLeadAction,
}: {
  basePath: string;
  carLead: CarLeadForEdit;
  updateCarLeadAction: FormAction;
}) {
  return (
    <Card className="bw-modal-card">
      <CardHeader>
        <CardTitle>Edytuj lead transportowy</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateCarLeadAction} className="lead-form">
          <input type="hidden" name="id" value={carLead.id} />
          <input type="hidden" name="returnPath" value={basePath} />
          <label className="field">
            <span>Typ pojazdu</span>
            <Input name="vehicleType" defaultValue={carLead.vehicleType ?? ""} />
          </label>
          <label className="field">
            <span>Liczba osob</span>
            <Input type="number" name="passengers" defaultValue={carLead.passengers ?? ""} />
          </label>
          <label className="field">
            <span>Dystans (km)</span>
            <Input type="number" name="distanceKm" defaultValue={carLead.distanceKm ?? ""} />
          </label>
          <label className="field">
            <span>Miejsce odbioru</span>
            <Input name="pickupLocation" defaultValue={carLead.pickupLocation ?? ""} />
          </label>
          <div className="bw-modal-actions">
            <Link href={basePath}>
              <Button type="button" variant="outline">
                Anuluj
              </Button>
            </Link>
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
