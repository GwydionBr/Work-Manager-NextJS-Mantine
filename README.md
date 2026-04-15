# Work Manager Web

**Status: Deprecated und archiviert** (Stand: **15. April 2026**)

Dieses Repository wird **nicht mehr aktiv gepflegt**. Abhängigkeiten und Sicherheitsfixes werden nicht mehr fortlaufend eingespielt. Nutzung erfolgt auf **eigenes Risiko**.

## Sicherheit vor dem Start

Weil das Projekt nicht mehr maintained wird, können bekannte Schwachstellen in Transitive Dependencies bestehen oder neu dazukommen.

1. **Dependency-Audit ausführen** (je nachdem, welchen Package-Manager du nutzt):
   - npm: `npm audit` (optional: `npm audit fix` nur nach Prüfung der Änderungen)
   - Yarn: `yarn npm audit` (Yarn 2+)
   - pnpm: `pnpm audit`
   - Bun: `bun audit`

2. Ergebnisse **manuell einordnen**: Fixes können Breaking Changes mit sich bringen; bei einem archivierten Projekt ist ein Upgrade-Pfad oft nicht mehr getestet.

3. **Keine Secrets** committen. Lokale Konfiguration nur in `.env.local` (nicht versioniert).

## Voraussetzungen

- [Node.js](https://nodejs.org/) (Version passend zu Next.js 15; LTS empfohlen)
- Ein Package-Manager: Das Repo enthält eine `package-lock.json` (npm). In `package.json` ist zusätzlich `packageManager: yarn@4.6.0` vermerkt; du kannst bei Bedarf Yarn nutzen, sofern du die Lockfile-Strategie für dein Setup abstimmst.

## Projekt lokal starten

1. Repository klonen und ins Verzeichnis wechseln.

2. Wie oben: **Security-Audit** ausführen und bewerten.

3. Abhängigkeiten installieren:

   ```bash
   npm ci
   ```

   Alternativ: `npm install` (ohne strikte Reproduzierbarkeit aus der Lockfile).

4. **Umgebungsvariablen** anlegen: Im Projektroot eine Datei `.env.local` erstellen (nicht einchecken). Mindestens für Supabase und Auth werden typischerweise folgende Variablen benötigt:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ROOT_URL` (optional; Standard für OAuth-Redirect ist `http://localhost:3000/`)

   Für bestimmte Server-Aktionen kann außerdem nötig sein:

   - `SUPABASE_SERVICE_ROLE_KEY`

   Weitere Werte (z. B. Sentry) können in den jeweiligen Sentry-Konfigurationsdateien des Projekts vorkommen.

5. Entwicklungsserver starten:

   ```bash
   npm run dev
   ```

   Die App läuft standardmäßig unter [http://localhost:3000](http://localhost:3000).

6. Produktionsbuild (optional):

   ```bash
   npm run build
   npm run start
   ```

## Nützliche Skripte

| Befehl        | Beschreibung              |
| ------------- | ------------------------- |
| `npm run dev` | Entwicklungsserver (Turbopack) |
| `npm run build` | Production-Build        |
| `npm run start` | Production-Server (nach `build`) |
| `npm run lint` | ESLint                    |
| `npm test`   | Jest-Tests                |

## Technischer Hintergrund (historisch)

Ursprünglich basierend auf dem [Mantine Next.js App Router Template](https://github.com/mantinedev/next-template) mit Next.js, Mantine, Supabase und weiteren Bibliotheken. Details zu einzelnen Features sind ohne aktive Wartung nur noch als Referenz im Code relevant.
