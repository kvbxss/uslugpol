# Us³ugPOL - Modular Monolith (Zadanie Rekrutacyjne)

## 1. Cel projektu
Celem projektu jest pokazanie, jak zaprojektowaæ i wdro¿yæ **Core system** dla holdingu us³ugowego Us³ugPOL w architekturze **Modular Monolith** z wyraŸnymi **Bounded Contexts**, zachowuj¹c autonomiê spó³ek-córek i jednoczeœnie wspieraj¹c sprzeda¿ krzy¿ow¹ (cross-sell).

Projekt realizuje MVP nastawione na:
- centralne zarz¹dzanie leadami,
- asynchroniczn¹ komunikacjê zdarzeniow¹,
- izolacjê domen i danych,
- gotowoœæ do przysz³ego wydzielenia modu³ów do mikroserwisów.

## 2. Kontekst biznesowy
Us³ugPOL to marka parasolowa obejmuj¹ca trzy obszary:
- sprz¹tanie (`cleaning`),
- organizacja imprez (`event`),
- wynajem aut (`car`).

Problem biznesowy:
- zespo³y i dane s¹ rozdzielone,
- klient widzi jedn¹ markê,
- brakuje mechanizmu wykrywania okazji cross-sell miêdzy spó³kami.

Przyk³ad:
- lead eventowy oddalony od miasta/biura powinien generowaæ sugestiê wynajmu aut.

## 3. Zakres zrealizowanego MVP

## Core (`packages/core`)
- przyjmowanie leadów z kana³ów: `phone`, `email`, `form`,
- kategoryzacja leadów: `cleaning`, `event`, `car`,
- statusy: `new -> qualified -> converted`,
- rejestrowanie i publikacja zdarzeñ domenowych,
- wykrywanie okazji cross-sell,
- audyt dzia³añ.

## Event Service (`packages/event-service`)
- subskrypcja leadów eventowych,
- w³asny model danych `event_data`,
- rozszerzenie danych o pola domenowe (`eventDate`, `location`, `eventType`, `guestCount`, `budget`),
- zg³aszanie feedbacku do Core (opportunity).

## Car Service (`packages/car-service`)
- subskrypcja leadów car,
- w³asny model danych `transport_requests`,
- obs³uga propozycji cross-sell,
- decyzje o akceptacji/odrzuceniu okazji.

## Web UI (`apps/web`)
- dashboard operacyjny dla MVP,
- intake leadów,
- podgl¹d leadów i opportunities,
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
- wyraŸny podzia³ na konteksty domenowe (`core`, `event-service`, `car-service`),
- komunikacja przez kontrakty i eventy, nie przez bezpoœrednie zale¿noœci miêdzy us³ugami.

## Komunikacja asynchroniczna
- u¿yty **in-memory EventBus** jako adapter MVP,
- Core publikuje zdarzenia (`core.lead.created`, `core.lead.status_changed`, `core.opportunity.detected`),
- modu³y domenowe subskrybuj¹ tylko potrzebne eventy,
- architektura przygotowana do podmiany EventBus na zewnêtrzny broker (np. Kafka) bez przebudowy logiki domenowej.

## Izolacja i granice modu³ów
- Core nie zna szczegó³ów implementacyjnych us³ug,
- modu³y biznesowe nie powinny bezpoœrednio czytaæ API/tabel innych modu³ów,
- dodatkowo zastosowano regu³y lint (`no-restricted-imports`) pilnuj¹ce granic kontekstów.

## 5. Model danych i baza

## PostgreSQL
Jedna instancja PostgreSQL, logiczny podzia³ na schematy:
- `core`
- `event_service`
- `car_service`

## ORM i migracje
- Drizzle ORM,
- osobne konfiguracje migracji per bounded context:
- `drizzle.core.config.ts`
- `drizzle.event-service.config.ts`
- `drizzle.car-service.config.ts`

## 6. Regu³y cross-sell (MVP)
Zaimplementowane regu³y obejmuj¹:
- analizê kontekstow¹ opisu/lokalizacji leada eventowego,
- regu³ê odleg³oœci (`> 50 km`) dla sugestii `car`,
- geolokalizacjê wzglêdem biura (konfigurowalne ENV),
- pêtlê feedbacku z modu³u event do Core (zg³oszenie potrzeby transportu).

## 7. Widocznoœæ danych
- Core: pe³ny wgl¹d w leady i actions/audit.
- Modu³ domenowy: tylko w³asne dane + rekomendacje cross-sell przekazane przez Core.
- Brak bezpoœredniej zale¿noœci domena->domena.

## 8. Stack technologiczny
- Monorepo: **Turborepo**
- Framework: **Next.js (App Router)**
- Jêzyk: **TypeScript**
- DB: **PostgreSQL**
- ORM: **Drizzle ORM**
- UI: komponenty stylu **ShadCN-like** (lokalne komponenty UI)

## 9. Struktura repozytorium
```txt
apps/
  web/                      # UI + endpointy App Router
packages/
  core/                     # orkiestracja leadów, statusy, cross-sell, audit
  event-service/            # domena event
  car-service/              # domena car
  shared/                   # contracts, event bus, db bootstrap
  cleaning-service/         # miejsce na dalszy rozwój
```

## 10. Uruchomienie lokalne

## Wymagania
- Node.js 18+
- npm 10+
- Docker (dla Postgres)

## Kroki
1. Instalacja zale¿noœci:
```sh
npm install
```

2. Uruchomienie PostgreSQL:
```sh
docker compose up -d
```

3. Konfiguracja `.env`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/uslugpol
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

## 11. Najwa¿niejsze komendy
```sh
npm run dev
npm run build
npm run lint
npm run check-types

npm run db:generate
npm run db:generate:all
npm run db:migrate
```

## 12. Mapa wymagañ -> implementacja
- Core lead management: ?
- Kana³y intake + kategoryzacja: ?
- Status workflow: ?
- Extensibility przez dane domenowe poza Core: ?
- Cross-sell engine: ?
- Feedback loop z modu³u domenowego: ?
- Asynchroniczna komunikacja event-driven: ? (adapter in-memory)
- Podzia³ DB na schematy: ?
- Izolacja bounded contexts: ? (architektura + regu³y lint)
- Dashboard MVP: ?

## 13. Decyzje projektowe i kompromisy
- Wybrano in-memory EventBus dla szybkoœci MVP i czytelnoœci architektury.
- UI jest celowo operacyjne, nie produkcyjne.
- Priorytetem by³a poprawna architektura i granice modu³ów, nie pe³ne pokrycie edge-case’ów.

## 14. Kierunki dalszego rozwoju
- Podmiana EventBus na Kafka/RabbitMQ.
- Outbox pattern dla gwarancji dostarczenia eventów.
- Silniejsze RBAC i separacja widoków per spó³ka.
- Testy integracyjne cross-context.
- Wydzielenie modu³ów do mikroserwisów bez zmiany kontraktów domenowych.

