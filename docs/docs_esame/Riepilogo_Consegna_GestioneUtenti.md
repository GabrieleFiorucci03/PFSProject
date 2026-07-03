# Riepilogo consegna — Gestione Utenti (sola visualizzazione)

> Esame "Progettazione Full Stack" (Prof. Bianchini, UniBS) — Appello 20260629
> Documento di studio: raccoglie **tutte** le modifiche fatte rispetto al progetto
> originale per soddisfare i tre esercizi della consegna.

---

## La consegna in breve

Introdurre la **gestione utenti limitata alla sola visualizzazione** degli utenti
registrati:

- Pagina accessibile **solo agli ADMIN**.
- Tabella con colonne **id, name, email, role**.
- Pulsanti **Nuovo / Modifica / Elimina** (con conferma sulla cancellazione).
- Stile uguale alle pagine libri/autori/categorie già esistenti.
- Le pagine di **insert/edit NON sono richieste** (la cancellazione era opzionale,
  ma è stata comunque implementata e funzionante).

I tre esercizi:
1. **Esercizio 1** — modello ipertestuale **WebML** della pagina.
2. **Esercizio 2** — rotta **backend NestJS** che espone gli utenti.
3. **Esercizio 3** — pagina **frontend React**.

Architettura del progetto: monorepo **Nx**, con `apps/api` (NestJS), `apps/ui`
(React + Vite), e librerie `libs/server/{auth,users,books,security}`.

---

## Esercizio 1 — Modello WebML (documentazione)

**File creato:** `Appello_20260629/docs/Esercizio1_WebML_GestioneUtenti.md`

Questo esercizio è solo documentale: non tocca il codice, ma **giustifica** le scelte
di Es.2 ed Es.3 tramite il modello ipertestuale WebML. Di seguito il contenuto
**integrale** del documento.

> Progettazione model-driven dei contenuti ipertestuali (WebML).
> Riferimenti: slide L9 (notazione) e L10 (running example "Area libri" + mapping all'implementazione).

### 1.1 Premesse e requisiti

Dall'analisi dei requisiti (consegna):

- Funzionalità di **gestione utenti**, limitata alla **sola visualizzazione** degli utenti registrati.
- Accesso consentito **solo agli amministratori** → la pagina appartiene alla **site view privata dell'amministratore** (area *privata*: accesso tramite autenticazione + autorizzazione di ruolo `ADMIN`).
- La pagina mostra una **tabella** con `id`, `nome` (`name`), `email`, `ruolo` (`role`).
- Sono presenti i **pulsanti** per: inserimento nuovo utente, modifica utente, cancellazione (con conferma).
- Le pagine di inserimento/modifica **non** sono realizzate (i relativi link puntano a pagine non ancora sviluppate). La cancellazione è opzionale.

**Entità coinvolta** (dal modello dei dati): `User(id, name, email, passwordHash, role)`.
Nella pubblicazione ipertestuale l'attributo `passwordHash` **non** viene mai esposto.

### 1.2 Progetto coarse — Area Utenti

Si individua una nuova **area** coesa, dedicata alla gestione degli utenti, all'interno della
site view privata dell'amministratore (analoga alle aree "libri", "autori", "categorie").

```
:................................................:
: Area Utenti                                    :
:------------------------------------------------:
: Core   (User)                                  :
: Delete (User)            <-- opzionale          :
: [Create (User)]          <-- pagina non realizzata
: [Modify (User)]          <-- pagina non realizzata
:................................................:
```

- **Core(User)**: pubblicazione dei contenuti dell'entità core `User` → richiesta dell'esercizio.
- **Delete(User)**: operazione CUD di cancellazione (opzionale).
- **Create(User) / Modify(User)**: previste come funzioni dell'area, ma **non realizzate** in questo
  esercizio (i pulsanti sono comunque mostrati e i link puntano alle relative pagine).

**Visibilità dell'area:** *privata* (accesso previa autenticazione e con ruolo `ADMIN`).

### 1.3 Progetto dettagliato — suddivisione in pagine

L'area si suddivide nelle seguenti pagine (solo la prima è realizzata in questo esercizio):

```
:..........................:     :..........................:     :..........................:
: Lista Utenti          [L] :     : Crea Utente          [L] :     : Modifica Utente          :
:--------------------------:     :--------------------------:     :--------------------------:
: Core   (User)            :     : Create (User)            :     : Modify (User)            :
: Delete (User)            :     : (non realizzata)         :     : (non realizzata)         :
:..........................:     :..........................:     :..........................:
```

- **Lista Utenti** — pagina **Landmark `[L]`**: globalmente visibile, raggiungibile da ogni altra
  pagina della site view tramite la *navbar* (voce "Utenti"). È la pagina oggetto dell'esercizio.
- **Crea Utente** / **Modifica Utente**: pagine non realizzate (placeholder di destinazione dei link).

### 1.4 Specifica di dettaglio della pagina «Lista Utenti»

#### Diagramma WebML

```
                         PAGINA: Lista Utenti  [L]
   .............................................................................
   :                                                                           :
   :     +-----------------------------+                                       :
   :     |        UtentiUnit           |                                       :
   :     |   [::] MultipleDetails      |----- (modifica) userID ---------------+--->  PAGINA
   :     |                             |   link contestuale                    :     Modifica Utente
   :     |          User               |                                       :     ( User[ID==?] )
   :     |  (id, name, email, role)    |                                       :
   :     +-----------------------------+                                       :
   :            |              \                                               :
   :            |               \  (elimina) userID                           :
   :            |                \  normal link                               :
   :            |                 v                                            :
   :            |          +-------------+      OK (verde)                     :
   :            |          |   Delete    |---------------------> [refresh]     :
   :            |          |   ( - )     |        ricarica la pagina Lista Utenti
   :            |          |   User      |---------------------> ErrorPage     :
   :            |          +-------------+      KO (rosso)                     :
   :            |                                                              :
   :  (nuovo utente) link non contestuale                                      :
   :            +-------------------------------------------------------------+--->  PAGINA
   :                                                                           :     Crea Utente
   :...........................................................................:

   LEGENDA
   [::] MultipleDetails unit   ( - ) Delete operation unit
   --->  link               ----- link contestuale (trasporta userID)
   OK = link verde (successo)   KO = link rosso (fallimento)
```

#### View component — `UtentiUnit` (MultipleDetails)

Si usa una **MultipleDetails unit** perché la pagina pubblica **un insieme di istanze**
dell'entità `User`, mostrando per ciascuna più attributi contemporaneamente (la tabella).

| Proprietà            | Valore                                                          |
|----------------------|-----------------------------------------------------------------|
| Tipo unità           | **MultipleDetails**                                             |
| Contenitore (sorgente) | entità `User`                                                 |
| Selettore            | *nessuno* → tutte le istanze (l'admin vede tutti gli utenti)    |
| Attributi pubblicati | `id`, `name`, `email`, `role` (mai `passwordHash`)              |
| Parametri in input   | nessuno                                                         |
| Parametri in output  | l'insieme degli `{id}` degli utenti pubblicati; `userID` della riga selezionata per i link |

#### Operazione — `Delete(User)` *(opzionale)*

| Proprietà         | Valore                                                              |
|-------------------|---------------------------------------------------------------------|
| Tipo              | **Delete** operation unit                                           |
| Entità            | `User`                                                              |
| Normal link (in)  | dalla `UtentiUnit`, trasporta lo `userID` dell'utente da eliminare  |
| Link OK (verde)   | torna a **Lista Utenti** (ricalcolo/refresh della MultipleDetails)  |
| Link KO (rosso)   | va a **ErrorPage**                                                  |

La conferma ("con conferma") è modellata come interazione che precede l'attivazione del
*normal link* verso l'operazione `Delete`.

#### Link uscenti dalla pagina

| Pulsante        | Tipo di link                         | Destinazione        | Contesto trasportato |
|-----------------|--------------------------------------|---------------------|----------------------|
| **Nuovo utente** | link **non contestuale**            | pagina Crea Utente  | nessuno              |
| **Modifica**    | link **contestuale**                 | pagina Modifica Utente | `userID` (→ `User[ID==?]`) |
| **Elimina**     | **normal link** verso operazione Delete | Delete(User)     | `userID`             |

### 1.5 Layout di pagina (navbar + utente corrente)

Come nel running example, il **Layout page** è un modulo `[M]` globale che definisce navbar e
informazioni sull'utente autenticato. La voce di menu **"Utenti"** (verso la pagina *Lista Utenti*
landmark) è visibile **solo** se l'utente corrente ha ruolo `ADMIN`.

```
:..............................:
: Layout page              [M] :
:------------------------------:
:   ( ) CurrentUser            :
:        |                     :
:        v                     :
:   [=] User [ID==?]           :   (Details dell'utente loggato, mostrato in navbar)
:..............................:
   navbar -> { Catalogo | Autori | Categorie | **Utenti (solo ADMIN)** | Logout }
```

### 1.6 Mapping verso l'implementazione (coerente con L10)

| Costrutto WebML                         | Implementazione                                                            |
|-----------------------------------------|----------------------------------------------------------------------------|
| Pagina *Lista Utenti*                   | componente React `users.page.tsx`                                          |
| View component *UtentiUnit* (visualizz.) | tabella renderizzata nel componente React                                  |
| Caricamento dati dal backend            | funzione `fetchUsers()` in `users.api.ts` → `GET /api/users` (solo ADMIN)  |
| Operazione *Delete(User)*               | funzione `deleteUser(id)` in `users.api.ts` → `DELETE /api/users/:id`      |
| Link automatico (rendering)             | `useEffect` che invoca `fetchUsers()` al mount                             |
| Pagina landmark *Utenti*                | voce della **navbar** nel `app-layout.tsx` (visibile solo agli ADMIN)      |
| Link contestuale *Modifica*             | `navigate('/users/:id/edit')`                                              |
| Link non contestuale *Nuovo utente*     | `navigate('/users/new')`                                                   |
| ErrorPage (link KO)                     | gestione dello stato `error` nel componente                                |

---

## Esercizio 2 — Backend NestJS

Obiettivo: esporre la lista utenti **senza mai restituire `passwordHash`**, su una
rotta protetta accessibile solo agli ADMIN (la rotta `GET /api/users` già esisteva).

### 1) Nuova interfaccia `UserListItem` (FILE NUOVO)

`libs/server/users/src/lib/interfaces/user-list-item.interface.ts`

```ts
import { UserRole } from '../dto/user-role.enum';

/**
 * Proiezione "sicura" di un utente per la pubblicazione ipertestuale
 * (View component UtentiUnit dell'Esercizio 1): espone solo gli attributi
 * mostrati nella tabella, escludendo sempre `passwordHash`.
 */
export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
```

**Perché:** è la "proiezione sicura" dell'entità utente. Definisce un tipo che
contiene **solo** i campi mostrati in tabella, garantendo a livello di tipo che
`passwordHash` non venga propagato verso il frontend.

### 2) Export dell'interfaccia (MODIFICA)

`libs/server/users/src/index.ts` — aggiunta l'ultima riga:

```ts
export * from './lib/users.module';
export * from './lib/users.service';
export * from './lib/users.repository';
export * from './lib/user.entity';
export * from './lib/dto/user-role.enum';
export * from './lib/dto/create-user.dto';
export * from './lib/dto/update-user.dto';
export * from './lib/interfaces/user-list-item.interface';   // <-- AGGIUNTA
```

**Perché:** rende `UserListItem` importabile sia dal backend sia dal frontend
(`import { UserListItem } from '@server/users'`), così client e server condividono
lo stesso contratto di tipo.

### 3) Mapping in `getUsers()` (MODIFICA)

`libs/server/users/src/lib/users.service.ts`

```ts
import { UserListItem } from './interfaces/user-list-item.interface';   // <-- import aggiunto

async getUsers(role?: UserRole): Promise<UserListItem[]> {              // <-- tipo di ritorno cambiato
    const users = await this.usersRepository.findAll(role);

    if (role && users.length === 0) {
        throw new NotFoundException(`No users found with role ${role}`);
    }

    // Mapping verso la proiezione "sicura": non esporre mai passwordHash.
    return users.map(({ id, name, email, role }) => ({ id, name, email, role }));   // <-- AGGIUNTA
}
```

**Perché:** prima il metodo restituiva le entità complete (incluso `passwordHash`).
Ora il `.map()` estrae solo i quattro campi previsti → la rotta non espone più dati
sensibili.

### Quadro completo delle rotte del controller utenti

`libs/server/users/src/lib/users.controller.ts` — il controller è montato su
`@Controller('users')` e il prefisso globale dell'app è `/api`, quindi tutte le
rotte vivono sotto `/api/users`. Ecco **ogni rotta** con le relative protezioni:

| Metodo + path | Guardie | Ruoli ammessi | Cosa fa | Usata dalla consegna? |
|---------------|---------|---------------|---------|------------------------|
| `GET /users` (opz. `?role=`) | `JwtAuthGuard`, `RolesGuard` | **ADMIN** | Lista utenti (proiezione sicura `UserListItem[]`) | ✅ Sì — alimenta la tabella |
| `GET /users/me` | `JwtAuthGuard` | qualsiasi loggato | Restituisce l'utente corrente dal token | indirettamente (navbar) |
| `GET /users/interns` | nessuna | pubblica | Placeholder ("API non implementata") | no |
| `GET /users/:id` | `JwtAuthGuard`, `RolesGuard` | ADMIN, USER | Dettaglio singolo utente | no |
| `POST /users` | nessuna | pubblica | Crea utente (accetta `role`) | no (preesistente) |
| `PATCH /users/:id` | `JwtAuthGuard`, `RolesGuard` | ADMIN | Aggiorna utente | no |
| `DELETE /users/:id` | `JwtAuthGuard`, `RolesGuard` | ADMIN | Cancella utente | ✅ Sì — pulsante "Elimina" |

> **Importante:** l'ordine di dichiarazione conta. `GET /users/me` e
> `GET /users/interns` sono dichiarati **prima** di `GET /users/:id`, altrimenti
> `:id` catturerebbe anche `me`/`interns` interpretandoli come id.

**Le due rotte effettivamente sfruttate dalla pagina:**

```ts
// 1) Lettura della lista (tabella)
@Get() // GET /api/users  oppure  /api/users?role=value
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@ApiQuery({ name: 'role', required: false, enum: UserRole })
getUsers(@Query('role', new ParseEnumPipe(UserRole, { optional: true })) role?: UserRole) {
    return this.serverUsersService.getUsers(role);
}

// 2) Cancellazione (pulsante Elimina)
@Delete(':id') // DELETE /api/users/:id
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.serverUsersService.removeUser(id);
}
```

**Come funziona la protezione (catena di guardie):**

1. `JwtAuthGuard` — legge l'header `Authorization: Bearer <token>`, valida il JWT e
   popola `request.user`. Senza token valido → **401 Unauthorized**.
2. `RolesGuard` — legge i ruoli richiesti impostati dal decoratore `@Roles(...)`
   (via metadata Reflector) e li confronta con il ruolo dell'utente nel token. Se
   non combaciano → **403 Forbidden**.
3. `@Roles(UserRole.ADMIN)` — non esegue logica: **annota** la rotta con i ruoli
   ammessi, che `RolesGuard` poi legge. È il pezzo che impone "solo ADMIN".
4. `@ApiBearerAuth()` / `@ApiQuery(...)` — solo documentazione Swagger, nessun
   effetto a runtime.

**Pipe sui parametri:**

- `ParseIntPipe` su `:id` → converte e valida che l'id sia un intero (altrimenti 400).
- `ParseEnumPipe(UserRole, { optional: true })` sul query `role` → accetta solo
  valori validi dell'enum, ed è opzionale.

**Flusso completo di una richiesta `GET /api/users` (end-to-end):**

```
UsersPage (useEffect)
   → fetchUsers()                       [users.api.ts]
   → GET /api/users  + Bearer token
        → JwtAuthGuard  (valida token, set request.user)
        → RolesGuard    (richiede ADMIN)
        → ServerUsersController.getUsers()
        → ServerUsersService.getUsers()  [mappa a UserListItem, niente passwordHash]
        → UsersRepository.findAll()
   ← JSON: UserListItem[]
   → setUsers(...)  → render tabella
```

---

## Esercizio 3 — Frontend React

Obiettivo: nuova pagina `/users` (solo ADMIN) con tabella e pulsanti, in stile
identico alle altre pagine.

### 1) API client (FILE NUOVO)

`apps/ui/src/features/users/users.api.ts`

**Codice completo del file (fedele all'originale):**

```ts
import { UserListItem } from '@server/users';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchUsers(): Promise<UserListItem[]> {
    const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }
}
```

**Perché:** centralizza le chiamate HTTP (con token JWT negli header) e riusa il tipo
`UserListItem` esportato dal backend. Coerente con gli altri `*.api.ts`.

### 2) Pagina elenco utenti (FILE NUOVO)

`apps/ui/src/features/users/users.page.tsx`

Punti chiave:
- Carica gli utenti con `fetchUsers()` dentro un `useEffect`, gestendo gli stati
  `loading` / `error`.
- Tabella con colonne **Id / Nome / Email / Ruolo / Azioni**.
- Pulsante **"Nuovo utente"** → naviga a `/users/new`.
- Pulsante **"Modifica"** per riga → naviga a `/users/:id/edit`.
- Pulsante **"Elimina"** per riga → `window.confirm` di conferma, poi `deleteUser(id)`
  e aggiornamento ottimistico della lista (`filter`).
- Stile riutilizzato da `../css/books.module.css`.

**Codice completo del file:**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import book_styles from '../css/books.module.css';
import { UserListItem } from '@server/users';
import { deleteUser, fetchUsers } from './users.api';

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Vuoi davvero cancellare questo utente?');

    if (!confirmed) return;

    try {
      await deleteUser(id);
      setUsers((current) => current.filter((user) => user.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Caricamento utenti...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.error}>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardLarge)}>
        <header className={book_styles.header}>
          <h1 className={book_styles.title}>👤 Utenti</h1>
          <p className={book_styles.subtitle}>
            Elenco degli utenti registrati nella libreria.
          </p>
        </header>

        <button
          className={book_styles.button}
          onClick={() => navigate('/users/new')}
        >
          Nuovo utente
        </button>

        {users.length === 0 ? (
          <p className={book_styles.message}>Nessun utente disponibile.</p>
        ) : (
          <div className={book_styles.tableWrapper}>
            <table className={book_styles.table}>
              <thead>
                <tr>
                  <th className={book_styles.th}>Id</th>
                  <th className={book_styles.th}>Nome</th>
                  <th className={book_styles.th}>Email</th>
                  <th className={book_styles.th}>Ruolo</th>
                  <th className={book_styles.th}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={book_styles.row}>
                    <td className={book_styles.td}>{user.id}</td>
                    <td className={book_styles.titleCell}>{user.name}</td>
                    <td className={book_styles.td}>{user.email}</td>
                    <td className={book_styles.td}>{user.role}</td>
                    <td className={book_styles.td}>
                      <button
                        className={book_styles.secondaryButton}
                        onClick={() => navigate(`/users/${user.id}/edit`)}
                      >
                        Modifica
                      </button>

                      <button
                        className={book_styles.dangerButton}
                        onClick={() => handleDelete(user.id)}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
```

**Spiegazione riga per riga delle scelte:**

- `const [users, setUsers] = useState<UserListItem[]>([])` — lo stato è **tipizzato**
  con il contratto condiviso `UserListItem`: il compilatore garantisce che si accede
  solo a `id/name/email/role`.
- `useEffect(..., [])` con array di dipendenze vuoto → il fetch parte **una sola
  volta** al montaggio del componente.
- `.then(setSomething).catch(...).finally(...)` → pattern a tre stati
  (dati / errore / caricamento), identico alle altre pagine del progetto.
- `handleDelete` → **conferma** con `window.confirm` (requisito della consegna),
  poi cancella sul server e infine aggiorna lo stato locale con
  `filter((user) => user.id !== id)` (**aggiornamento ottimistico**: non si rifà la
  fetch, si rimuove la riga dallo stato).
- Rendering condizionale: `loading` → messaggio; `error` → messaggio d'errore;
  lista vuota → "Nessun utente disponibile"; altrimenti → tabella.
- Le classi CSS (`page`, `card`, `cardLarge`, `table`, `th`, `td`, `titleCell`,
  `secondaryButton`, `dangerButton`, ...) sono **riusate** da `books.module.css`,
  così lo stile è identico alle pagine libri/autori/categorie.

> **Nota sull'evoluzione:** nella prima versione i pulsanti "Nuovo" e "Modifica"
> erano `disabled` con `title="Funzione non disponibile"`. In un secondo momento
> sono stati resi cliccabili e fatti puntare alla paginetta "Funzione non
> implementata" (vedi sezione successiva).

### 3) Pagina "Funzione non implementata" (FILE NUOVO)

`apps/ui/src/features/users/user-not-implemented.page.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import book_styles from '../css/books.module.css';

export function UserNotImplementedPage() {
  const navigate = useNavigate();
  return (
    <main className={book_styles.page}>
      <section className={clsx(book_styles.card, book_styles.cardSmall)}>
        <h1 className={book_styles.title}>🚧 Funzione non implementata</h1>
        <p className={book_styles.message}>
          La creazione e la modifica degli utenti non sono ancora disponibili.
          La gestione utenti è attualmente limitata alla sola visualizzazione.
        </p>
        <button className={book_styles.button} onClick={() => navigate('/users')}>
          Torna agli utenti
        </button>
      </section>
    </main>
  );
}
```

**Perché:** la consegna non richiede insert/edit. Invece di lasciare pulsanti morti,
i pulsanti Nuovo/Modifica portano a questa pagina che dichiara esplicitamente che la
funzione non è implementata, mantenendo la UX coerente.

### 4) Rotte (MODIFICA)

`apps/ui/src/app/app.tsx` — sono stati aggiunti **2 import** e **3 rotte** (le righe
marcate `// <-- AGGIUNTA`). Di seguito il **file completo** per vedere le rotte nel
loro contesto:

```tsx
import { BooksPage } from '../features/books/books.page';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { LogoutPage } from '../features/auth/logout.page';
import { CreateBookPage } from '../features/books/create-book.page';
import { EditBookPage } from '../features/books/edit-book.page';
import { AppLayout } from '../features/layouts/app-layout';
import { HomeModulePage } from '../features/books/home-module.page';
import { HomeTailwindPage } from '../features/books/home-tailwind.page';
import { HomeBootstrapPage } from '../features/books/home-bootstrap.page';
import { AuthorsPage } from '../features/authors/authors.page';
import { CreateAuthorPage } from '../features/authors/create-author.page';
import { EditAuthorPage } from '../features/authors/edit-author.page';
import { CategoriesPage } from '../features/categories/categories.page';
import { CreateCategoryPage } from '../features/categories/create-category.page';
import { EditCategoryPage } from '../features/categories/edit-category.page';
import { UsersPage } from '../features/users/users.page';                              // <-- AGGIUNTA
import { UserNotImplementedPage } from '../features/users/user-not-implemented.page';  // <-- AGGIUNTA

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/books" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/new" element={<CreateBookPage />} />
        <Route path="/books/:id/edit" element={<EditBookPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/authors/new" element={<CreateAuthorPage />} />
        <Route path="/authors/:id/edit" element={<EditAuthorPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/new" element={<CreateCategoryPage />} />
        <Route path="/categories/:id/edit" element={<EditCategoryPage />} />
        <Route path="/users" element={<UsersPage />} />                       {/* <-- AGGIUNTA */}
        <Route path="/users/new" element={<UserNotImplementedPage />} />      {/* <-- AGGIUNTA */}
        <Route path="/users/:id/edit" element={<UserNotImplementedPage />} /> {/* <-- AGGIUNTA */}
      </Route>

      <Route path="/home-module" element={<HomeModulePage />} />
      <Route path="/home-tailwind" element={<HomeTailwindPage />} />
      <Route path="/home-bootstrap" element={<HomeBootstrapPage />} />
    </Routes>
  );
}

export default App;
```

**Perché:** le tre rotte utenti sono inserite **dentro** il blocco protetto da
`<ProtectedRoute><AppLayout/></ProtectedRoute>` (richiedono login e mostrano la
navbar). `/users/new` e `/users/:id/edit` riusano la stessa pagina "non implementata".
Le rotte pubbliche (`/login`, `/logout`, le home demo) restano fuori dal blocco protetto.

### 5) Voce di menu nella navbar (MODIFICA)

`apps/ui/src/features/layouts/app-layout.tsx` — aggiunta la voce "Utenti" nella
sezione `navLinks` (riga marcata). Contesto del blocco modificato:

```tsx
<div className={styles.navLinks}>
  <button onClick={() => navigate('/books')}>Catalogo</button>
  <button onClick={() => navigate('/books/new')}>Nuovo libro</button>
  <button onClick={() => navigate('/authors')}>Autori</button>
  <button onClick={() => navigate('/categories')}>Categorie</button>
  {user?.role === 'ADMIN' && (                                      {/* <-- AGGIUNTA */}
    <button onClick={() => navigate('/users')}>Utenti</button>      {/* <-- AGGIUNTA */}
  )}                                                                {/* <-- AGGIUNTA */}

  <div className={styles.userSection}>
    {/* ... pulsante utente + dropdown logout (invariati) ... */}
  </div>
</div>
```

Il ruolo arriva dallo stato `user`, popolato al mount da `fetchCurrentUser()`
(`GET /api/users/me`):

```tsx
const [user, setUser] = useState(null);

useEffect(() => {
  fetchCurrentUser()
    .then(setUser)
    .catch((err) => setUser(null));
}, []);
```

**Perché:** la voce "Utenti" compare nel menu **solo se l'utente loggato è ADMIN**
(`user?.role === 'ADMIN'`), in linea con la consegna (pagina riservata agli ADMIN).

### Approfondimento — come funziona il routing frontend

Le tre rotte utenti sono **annidate** dentro una rotta "wrapper" senza `path`:

```tsx
<Route
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  {/* ... books, authors, categories ... */}
  <Route path="/users" element={<UsersPage />} />
  <Route path="/users/new" element={<UserNotImplementedPage />} />
  <Route path="/users/:id/edit" element={<UserNotImplementedPage />} />
</Route>
```

Cosa implica, passo per passo:

1. **Rotta wrapper (layout route):** non ha `path`, serve solo a raggruppare le
   rotte figlie e ad applicare loro lo stesso "guscio".
2. **`<ProtectedRoute>`** — verifica l'autenticazione (presenza/validità del token);
   se l'utente non è loggato reindirizza al login. Tutte le rotte figlie ereditano
   questa protezione → `/users`, `/users/new`, `/users/:id/edit` sono **tutte**
   accessibili solo da utenti autenticati.
3. **`<AppLayout>`** — disegna la navbar e poi un `<Outlet/>`: è dentro l'`Outlet`
   che React Router inietta la pagina figlia corrente. Per questo la navbar resta
   fissa mentre cambia solo il contenuto.
4. **`navigate(...)`** — la navigazione è programmatica (hook `useNavigate`):
   - `navigate('/users')` dalla navbar (solo ADMIN);
   - `navigate('/users/new')` dal pulsante "Nuovo utente";
   - `navigate('/users/${user.id}/edit')` dal pulsante "Modifica" (URL dinamico con id);
   - `navigate('/users')` dal pulsante "Torna agli utenti" nella pagina non implementata.
5. **`:id` è un parametro dinamico:** qualsiasi valore (`/users/7/edit`,
   `/users/42/edit`, ...) matcha la stessa rotta. Qui punta alla pagina "non
   implementata", quindi l'id non viene letto; in una vera edit si leggerebbe con
   `useParams()`.

**Livelli di protezione per `/users` (tre livelli):**

| Livello | Meccanismo | Cosa blocca |
|---------|-----------|-------------|
| Navbar | `user?.role === 'ADMIN'` | nasconde il link ai non-ADMIN |
| Frontend route | `<ProtectedRoute>` | blocca gli utenti non autenticati |
| Backend | `JwtAuthGuard` + `RolesGuard` + `@Roles(ADMIN)` | 401/403 su accesso non autorizzato (anche via URL diretto) |

Nota: la rotta frontend `/users` controlla solo l'autenticazione, non il ruolo;
la vera barriera sul ruolo è il **backend**, che risponde 403 a un non-ADMIN che
forzasse l'URL.

---

## Configurazione Nx

Avendo introdotto una dipendenza nuova `ui → @server/users` (per importare il tipo
`UserListItem`), è stato eseguito `nx sync` per aggiornare i *project references* di
TypeScript.

---

## Verifica finale

- `nx run-many -t build -p api ui` → **build OK** per entrambi i progetti.
- `nx lint`:
  - `ui` → solo *warning* preesistenti (`any` + emoji), identici a `categories.page`.
  - `@server/users:lint` → fallisce per una **dipendenza circolare PREESISTENTE**
    `@server/users ↔ @server/security` (controller ↔ roles.guard). **Non introdotta
    da noi.**

---

## Note / limiti noti (fuori scope della consegna)

- La pagina `/users` è protetta da `ProtectedRoute` (autenticazione) ma **non**
  ricontrolla il ruolo a livello di rotta frontend: un non-ADMIN che digita `/users`
  a mano riceve comunque **403 dal backend** (la pagina mostra l'errore). La voce in
  navbar è già nascosta ai non-ADMIN.
- `POST /users` e `register` restano **pubbliche** e accettano `role` (possibile
  *privilege escalation*) — comportamento preesistente, fuori dallo scope.
- Dipendenza circolare tra librerie server — preesistente.

---

## Elenco rapido dei file toccati

| File | Tipo | Esercizio |
|------|------|-----------|
| `docs/Esercizio1_WebML_GestioneUtenti.md` | nuovo | Es.1 |
| `libs/server/users/src/lib/interfaces/user-list-item.interface.ts` | nuovo | Es.2 |
| `libs/server/users/src/index.ts` | modificato | Es.2 |
| `libs/server/users/src/lib/users.service.ts` | modificato | Es.2 |
| `apps/ui/src/features/users/users.api.ts` | nuovo | Es.3 |
| `apps/ui/src/features/users/users.page.tsx` | nuovo | Es.3 |
| `apps/ui/src/features/users/user-not-implemented.page.tsx` | nuovo | Es.3 |
| `apps/ui/src/app/app.tsx` | modificato | Es.3 |
| `apps/ui/src/features/layouts/app-layout.tsx` | modificato | Es.3 |
