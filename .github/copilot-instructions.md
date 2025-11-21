Purpose
Provide concise, actionable guidance for AI coding assistants working on the PersonalFinanceTracker repository so they can be productive immediately.

How this repo is structured
- **Client (Angular)**: `financetracker.client/` — Angular 17 app. Key files:
  - `src/app/` — main app code, components, services. Example: `src/app/layout/app.sidebar.component.ts` shows UI-driven component that calls other components (e.g., `app-transactions`).
  - `package.json` and Angular CLI config (`angular.json`, `tsconfig.*`). Use `ng serve`, `ng build`, `ng test` for typical workflows.
- **Server (ASP.NET Core)**: `FinanceTracker.Server/` — backend server project.
  - Entry: `Program.cs` and `FinanceTracker.Server.csproj`.
  - Controllers: `Controllers/` (e.g., `AuthController.cs`, `UserController.cs`) — follow typical Web API patterns.
  - Data & Models: `Data/ApplicationDbContext.cs`, `Models/` (entities like `User`, `Transaction`, `Budget`). Migrations are under `Migrations/`.
  - Services & Repositories: `Services/` and `Repositories/` contain implementations such as `EmailService.cs`, `UserRepository.cs`, `VerificationStore.cs`.

Big-picture architecture and data flow
- Frontend (Angular) is the UI that calls the backend REST endpoints. Look at `src/app/*` for API-using services.
- Backend is a standard ASP.NET Core Web API with EF Core for persistence. `ApplicationDbContext` contains DbSets for domain models.
- Authentication/verification flows are implemented in `Controllers/AuthController.cs`, `Services/VerificationStore.cs`, and `Repositories/UserRepository.cs` — changes here affect login/register flows and email verification.

Project-specific conventions and patterns
- Angular components sometimes call sibling components via DOM query (`ElementRef.querySelector('app-transactions')`) instead of Angular @ViewChild in some spots — prefer using strongly-typed `@ViewChild(...)` when refactoring.
- Server-side repository and service classes follow simple DI registration (check `Program.cs` for registrations). When adding a service, register it in `Program.cs`.
- Database migrations use EF Core naming patterns; migration files are already present in `Migrations/`. Run `dotnet ef migrations add <Name>` from the `FinanceTracker.Server` project folder and apply with `dotnet ef database update` when needed.

Developer workflows (commands)
- Run frontend dev server: `cd financetracker.client && npm install && ng serve` (watching code changes).
- Build frontend (production): `cd financetracker.client && ng build --configuration production`.
- Run server: `cd FinanceTracker.Server && dotnet run` (launches API on configured port; check `Properties/launchSettings.json` for local settings).
- Run server migrations (requires dotnet-ef): `cd FinanceTracker.Server && dotnet tool restore && dotnet ef database update`.
- Run combined locally: Start server (dotnet run) and start client (ng serve) — client proxy may be configured with `proxy.conf.js`.

Testing and debugging notes
- Frontend unit tests: `cd financetracker.client && ng test` (Karma).
- Server-side tests: none discovered — add tests under a test project if needed.
- Debugging the server: use Visual Studio/VS Code with the `FinanceTracker.Server` launch configuration (check `Properties/launchSettings.json`).

Integration points & external dependencies
- Email sending: `Services/EmailService.cs` — verify SMTP/third-party credentials in configuration files (appsettings.*).
- Any third-party API keys should be expected in `appsettings.json` or environment variables.
- Frontend proxy: `financetracker.client/src/proxy.conf.js` may be used to forward calls to the API during local dev.

Editing & PR guidance for AI assistants
- Make minimal, focused changes. Respect existing folder layout and naming.
- When touching the API surface (controllers/models), update EF migrations if the DB schema changed.
- When adding an Angular component or service, follow existing file naming and register modules where appropriate (see `app.module.ts`).
- Prefer strongly-typed Angular patterns (use `@ViewChild(ComponentClass)` instead of DOM querying) when making improvements.

Examples from the codebase
- `financetracker.client/src/app/layout/app.sidebar.component.ts`: demonstrates a sidebar calling `app-transactions` via `ElementRef.querySelector`. Consider replacing this pattern with `@ViewChild(TransactionsComponent)` to call `openModal()` directly.
- `FinanceTracker.Server/Data/ApplicationDbContext.cs`: single source of truth for EF DbSets — update migrations after model changes.

When unsure, ask the human reviewer
- Which environment variables or secrets are expected locally (SMTP, DB connection string)?
- Should code style changes (e.g., replacing DOM queries with `@ViewChild`) be applied across the repo now or incrementally?

If you want changes applied now
- Reply with a short list: (1) Add/modify server code? (2) Update Angular components? (3) Run builds/tests? and I'll implement them.

Contact
- Repo owner: check git history / commit authors for the primary maintainer; open a PR for non-trivial changes and request review.
