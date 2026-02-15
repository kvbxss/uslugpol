# Us�ugPOL - Modular Monolith (Zadanie Rekrutacyjne)

## 1. Cel projektu

Celem projektu jest **Core system** dla holdingu us�ugowego Us�ugPOL w architekturze **Modular Monolith** z wyra�nymi **Bounded Contexts**, zachowuj�c autonomi� sp�ek-c�rek i jednocze�nie wspieraj�c sprzeda� krzy�ow� (cross-sell).

Projekt realizuje MVP nastawione na:

- centralne zarz�dzanie leadami,
- asynchroniczn� komunikacj� zdarzeniow�,
- izolacj� domen i danych,
- gotowo�� do przysz�ego wydzielenia modu��w do mikroserwis�w.

## 2. Kontekst biznesowy

Us�ugPOL to marka parasolowa obejmuj�ca trzy obszary:

- sprz�tanie (`cleaning`),
- organizacja imprez (`event`),
- wynajem aut (`car`).

Problem biznesowy:

- zespo�y i dane s� rozdzielone,
- klient widzi jedn� mark�,
- brakuje mechanizmu wykrywania okazji cross-sell mi�dzy sp�kami.

Przyk�ad:

- lead eventowy oddalony od miasta/biura powinien generowa� sugesti� wynajmu aut.

## 3. Zakres zrealizowanego MVP

## Core (`packages/core`)

- przyjmowanie lead�w z kana��w: `phone`, `email`, `form`,
- kategoryzacja lead�w: `cleaning`, `event`, `car`,
- statusy: `new -> qualified -> converted`,
- rejestrowanie i publikacja zdarze� domenowych,
- wykrywanie okazji cross-sell,
- audyt dzia�a�.

## Event Service (`packages/event-service`)

- subskrypcja lead�w eventowych,
- w�asny model danych `event_data`,
- rozszerzenie danych o pola domenowe (`eventDate`, `location`, `eventType`, `guestCount`, `budget`),
- zg�aszanie feedbacku do Core (opportunity).

## Car Service (`packages/car-service`)

- subskrypcja lead�w car,
- w�asny model danych `transport_requests`,
- obs�uga propozycji cross-sell,
- decyzje o akceptacji/odrzuceniu okazji.

## Web UI (`apps/web`)

- dashboard operacyjny dla MVP,
- intake lead�w,
- podgl�d lead�w i opportunities,
- edycja danych event/car,
- zmiana statusu leada.

## 4. Architektura

## Diagram architektury

```mermaid
flowchart TB

%% =========================
%% MODULARNY MONOLIT
%% =========================

subgraph MONOLIT["Modularny Monolit - UslugPOL (Next.js + TypeScript)"]

    subgraph CORE["Kontekst: CORE (Orkiestracja)"]
        LEAD_MGMT["Zarzadzanie Leadami"]
        STATUS_FLOW["Obsluga statusow"]
        CROSS_SELL["Silnik Cross-Sell"]
        AUDYT["Rejestr zdarzen (Audyt)"]
        EVENT_BUS["Magistrala Zdarzen (Event Bus)"]
    end

    subgraph CLEANING["Modul: Uslugi Sprzatania"]
        CLEANING_LOGIC["Logika domenowa"]
        CLEANING_META["Wlasne dane rozszerzajace"]
    end

    subgraph EVENT["Modul: Organizacja Imprez"]
        EVENT_LOGIC["Logika domenowa"]
        EVENT_META["Wlasne dane rozszerzajace"]
    end

    subgraph CAR["Modul: Wynajem Aut"]
        CAR_LOGIC["Logika domenowa"]
        CAR_META["Wlasne dane rozszerzajace"]
    end

end


%% =========================
%% KOMUNIKACJA ZDARZENIOWA
%% =========================

LEAD_MGMT --> EVENT_BUS
CROSS_SELL --> EVENT_BUS

EVENT_BUS --> CLEANING_LOGIC
EVENT_BUS --> EVENT_LOGIC
EVENT_BUS --> CAR_LOGIC

EVENT_LOGIC --> EVENT_BUS
CLEANING_LOGIC --> EVENT_BUS
CAR_LOGIC --> EVENT_BUS


%% =========================
%% BAZA DANYCH
%% =========================

subgraph DB["PostgreSQL (1 instancja)"]

    subgraph CORE_SCHEMA["Schemat: core"]
        T1["leady"]
        T2["lead_metadata"]
        T3["audit_log"]
    end

    subgraph CLEANING_SCHEMA["Schemat: cleaning_service"]
        T4["cleaning_data"]
    end

    subgraph EVENT_SCHEMA["Schemat: event_service"]
        T5["event_data"]
    end

    subgraph CAR_SCHEMA["Schemat: car_service"]
        T6["transport_requests"]
    end

end

LEAD_MGMT --> T1
LEAD_MGMT --> T2
AUDYT --> T3

CLEANING_LOGIC --> T4
EVENT_LOGIC --> T5
CAR_LOGIC --> T6
```

## Styl architektoniczny

- **Modular Monolith** w monorepo (Turborepo),
- wyra�ny podzia� na konteksty domenowe (`core`, `event-service`, `car-service`),
- komunikacja przez kontrakty i eventy, nie przez bezpo�rednie zale�no�ci mi�dzy us�ugami.

## Komunikacja asynchroniczna

- u�yty **in-memory EventBus** jako adapter MVP,
- Core publikuje zdarzenia (`core.lead.created`, `core.lead.status_changed`, `core.opportunity.detected`),
- modu�y domenowe subskrybuj� tylko potrzebne eventy,
- architektura przygotowana do podmiany EventBus na zewn�trzny broker (np. Kafka) bez przebudowy logiki domenowej.

## Izolacja i granice modu��w

- Core nie zna szczeg��w implementacyjnych us�ug,
- modu�y biznesowe nie powinny bezpo�rednio czyta� API/tabel innych modu��w,
- dodatkowo zastosowano regu�y lint (`no-restricted-imports`) pilnuj�ce granic kontekst�w.

## 5. Model danych i baza

## PostgreSQL

Jedna instancja PostgreSQL, logiczny podzia� na schematy:

- `core`
- `event_service`
- `car_service`

## ORM i migracje

- Drizzle ORM,
- osobne konfiguracje migracji per bounded context:
- `drizzle.core.config.ts`
- `drizzle.event-service.config.ts`
- `drizzle.car-service.config.ts`

## 6. Regu�y cross-sell (MVP)

Zaimplementowane regu�y obejmuj�:

- analiz� kontekstow� opisu/lokalizacji leada eventowego,
- regu�� odleg�o�ci (`> 50 km`) dla sugestii `car`,
- geolokalizacj� wzgl�dem biura (konfigurowalne ENV),
- p�tl� feedbacku z modu�u event do Core (zg�oszenie potrzeby transportu).

## 7. Widoczno�� danych

- Core: pe�ny wgl�d w leady i actions/audit.
- Modu� domenowy: tylko w�asne dane + rekomendacje cross-sell przekazane przez Core.
- Brak bezpo�redniej zale�no�ci domena->domena.

## 8. Stack technologiczny

- Monorepo: **Turborepo**
- Framework: **Next.js (App Router)**
- J�zyk: **TypeScript**
- DB: **PostgreSQL**
- ORM: **Drizzle ORM**
- UI: komponenty **ShadCN**

## 9. Struktura repozytorium

```txt
apps/
  web/                      # UI + endpointy App Router
packages/
  core/                     # orkiestracja lead�w, statusy, cross-sell, audit
  event-service/            # domena event
  car-service/              # domena car
  shared/                   # contracts, event bus, db bootstrap
  cleaning-service/         # miejsce na dalszy rozw�j
```

## 10. Uruchomienie lokalne

## Wymagania

- Node.js 18+
- npm 10+
- Docker (dla Postgres)

## Kroki

1. Instalacja zale�no�ci:

```sh
npm install
```

2. Uruchomienie PostgreSQL:

```sh
docker compose up -d
```

3. Konfiguracja `.env`:

```env
DATABASE_URL= url bazy postgresql
USLUGPOL_DISTANCE_THRESHOLD_KM=50
USLUGPOL_OFFICE_CITY=Krakow
USLUGPOL_OFFICE_LAT=50.0647
USLUGPOL_OFFICE_LON=19.9450
```

4. Migracje:

```sh
npm run db:migrate
```

5. Start aplikacji:

```sh
npm run dev
```

Aplikacja web: `http://localhost:4000`

## 11. Najwa�niejsze komendy

```sh
npm run dev
npm run build
npm run lint
npm run check-types

npm run db:generate
npm run db:generate:all
npm run db:migrate
```

## 12. Mapa wymaga� -> implementacja

- Core lead management: ?
- Kana�y intake + kategoryzacja: ?
- Status workflow: ?
- Extensibility przez dane domenowe poza Core: ?
- Cross-sell engine: ?
- Feedback loop z modu�u domenowego: ?
- Asynchroniczna komunikacja event-driven: ? (adapter in-memory)
- Podzia� DB na schematy: ?
- Izolacja bounded contexts: ? (architektura + regu�y lint)
- Dashboard MVP: ?

## 13. Decyzje projektowe i kompromisy

- Wybrano in-memory EventBus dla szybko�ci MVP i czytelno�ci architektury.
- UI jest celowo operacyjne, nie produkcyjne.
- Priorytetem by�a poprawna architektura i granice modu��w, nie pe�ne pokrycie edge-case��w.

## 14. Kierunki dalszego rozwoju

- Podmiana EventBus na Kafka/RabbitMQ.
- Outbox pattern dla gwarancji dostarczenia event�w.
- Silniejsze RBAC i separacja widok�w per sp�ka.
- Testy integracyjne cross-context.
- Wydzielenie modu��w do mikroserwis�w bez zmiany kontrakt�w domenowych.
