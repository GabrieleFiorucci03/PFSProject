# Piano di test — Gestione utenti (sola visualizzazione)

Verifica della consegna: pagina **solo ADMIN** con tabella utenti (`id`, `name`, `email`, `role`),
pulsanti **Nuovo** e **Modifica** presenti ma **non funzionanti** (solo estetica) ed **Elimina**
funzionante con conferma. Copre Es.2 (backend) ed Es.3 (frontend); l'Es.1 (modello WebML) è verificato
per coerenza.

---

## 0. Prerequisiti / setup

| # | Passo | Esito atteso |
|---|-------|--------------|
| 0.1 | DB Postgres `PFSExam` attivo su `127.0.0.1:5432` (vedi `.env`) | connessione OK |
| 0.2 | Avvio backend: `npm run start:api` | log `🚀 ... http://localhost:3333/api` |
| 0.3 | Avvio frontend: `npm run start:ui` | UI su `http://localhost:4200` |
| 0.4 | Swagger raggiungibile su `http://localhost:3333/api/docs` | pagina API visibile |
| 0.5 | Build pulita: `npx nx run-many -t build -p api ui` | entrambe **success** |

### Dati di test (nessun seed: si creano via `POST /api/users`, rotta pubblica)

```bash
# Utente ADMIN
curl -X POST http://localhost:3333/api/users -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@unibs.it","password":"Password1!","role":"ADMIN"}'

# Utente normale (USER)
curl -X POST http://localhost:3333/api/users -H "Content-Type: application/json" \
  -d '{"name":"Mario Rossi","email":"user@unibs.it","password":"Password1!","role":"USER"}'
```

Login per ottenere il token (ripetere cambiando email/password):

```bash
curl -X POST http://localhost:3333/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@unibs.it","password":"Password1!"}'   # → { access_token, user }
```

---

## 1. Test backend — Es.2 (`GET /api/users`, `DELETE /api/users/:id`)

| # | Test | Azione | Esito atteso |
|---|------|--------|--------------|
| 1.1 | Accesso senza token | `GET /api/users` senza header Authorization | **401 Unauthorized** |
| 1.2 | Accesso con ruolo USER | `GET /api/users` con token USER | **403 Forbidden** (`Insufficient permissions`) |
| 1.3 | Accesso con ruolo ADMIN | `GET /api/users` con token ADMIN | **200**, array di utenti |
| 1.4 | **passwordHash escluso** | ispezionare la risposta di 1.3 | ogni oggetto ha **solo** `id, name, email, role`; **nessun** `passwordHash` |
| 1.5 | Filtro per ruolo | `GET /api/users?role=ADMIN` con token ADMIN | solo utenti ADMIN |
| 1.6 | Filtro senza risultati | `GET /api/users?role=...` con ruolo non presente | **404** (`No users found with role ...`) |
| 1.7 | Filtro con ruolo non valido | `GET /api/users?role=PIPPO` | **400 Bad Request** (ParseEnumPipe) |
| 1.8 | Delete senza token | `DELETE /api/users/:id` senza token | **401** |
| 1.9 | Delete con ruolo USER | `DELETE /api/users/:id` con token USER | **403** |
| 1.10 | Delete con ruolo ADMIN | `DELETE /api/users/:id` di un utente esistente con token ADMIN | **200/204**, utente rimosso |
| 1.11 | Delete id inesistente | `DELETE /api/users/999999` con token ADMIN | **404** (`User with id ... not found`) |

> Esempio rapido per 1.4 (token ADMIN in `$T`):
> `curl http://localhost:3333/api/users -H "Authorization: Bearer $T"` → la risposta **non** deve
> contenere la stringa `passwordHash`.

---

## 2. Test frontend — Es.3 (pagina `/users`)

### 2.1 Visibilità voce navbar (solo ADMIN)

| # | Test | Azione | Esito atteso |
|---|------|--------|--------------|
| 2.1.1 | Navbar da ADMIN | login con `admin@unibs.it` | nella navbar compare la voce **Utenti** |
| 2.1.2 | Navbar da USER | logout, login con `user@unibs.it` | la voce **Utenti** **non** è presente |

### 2.2 Accesso alla pagina

| # | Test | Azione | Esito atteso |
|---|------|--------|--------------|
| 2.2.1 | Rotta protetta | aprire `http://localhost:4200/users` da non autenticato | redirect a **/login** (ProtectedRoute) |
| 2.2.2 | Apertura da ADMIN | da loggato ADMIN, click su **Utenti** | si apre la pagina con titolo "👤 Utenti" |
| 2.2.3 | Stato di caricamento | osservare il primo render | messaggio "Caricamento utenti..." prima dei dati |

### 2.3 Contenuto della tabella

| # | Test | Azione | Esito atteso |
|---|------|--------|--------------|
| 2.3.1 | Colonne corrette | guardare l'intestazione tabella | `Id`, `Nome`, `Email`, `Ruolo`, `Azioni` |
| 2.3.2 | Dati coerenti | confrontare righe con `GET /api/users` | stessi utenti, valori corretti |
| 2.3.3 | Nessun dato sensibile | ispezionare la tabella / DOM | **non** appare alcun `passwordHash` |
| 2.3.4 | Tabella vuota | (se nessun utente) | messaggio "Nessun utente disponibile." |

### 2.4 Pulsanti Nuovo / Modifica (solo estetica, NON cliccabili)

| # | Test | Azione | Esito atteso |
|---|------|--------|--------------|
| 2.4.1 | Pulsante "Nuovo utente" visibile | guardare la pagina | il pulsante è presente |
| 2.4.2 | "Nuovo utente" non cliccabile | tentare il click | nessuna azione/navigazione; pulsante **disabled** (cursore "non consentito", tooltip "Funzione non disponibile") |
| 2.4.3 | Pulsante "Modifica" visibile | guardare una riga | il pulsante è presente su ogni riga |
| 2.4.4 | "Modifica" non cliccabile | tentare il click | nessuna azione/navigazione; pulsante **disabled** |
| 2.4.5 | Nessuna rotta nuova/edit | aprire a mano `/users/new` o `/users/1/edit` | non esiste rotta dedicata (nessuna pagina insert/edit realizzata) |

### 2.5 Eliminazione (funzionante, con conferma)

| # | Test | Azione | Esito atteso |
|---|------|--------|--------------|
| 2.5.1 | Conferma presente | click su **Elimina** | appare `window.confirm` "Vuoi davvero cancellare questo utente?" |
| 2.5.2 | Annulla | nel dialog premere **Annulla** | nessuna chiamata DELETE; la riga resta |
| 2.5.3 | Conferma | nel dialog premere **OK** | la riga sparisce dalla tabella |
| 2.5.4 | Persistenza lato server | ricaricare la pagina / `GET /api/users` | l'utente eliminato **non** è più presente |
| 2.5.5 | Coerenza UI/stato | dopo delete | nessun errore in console; tabella aggiornata senza refresh manuale |

### 2.6 Gestione errori

| # | Test | Azione | Esito atteso |
|---|------|--------|--------------|
| 2.6.1 | Backend spento | fermare l'API e aprire `/users` | la pagina mostra il blocco di **errore** (non crash) |
| 2.6.2 | Token scaduto/assente | rimuovere `access_token` da localStorage e ricaricare | redirect a login oppure messaggio di errore |

---

## 3. Coerenza con Es.1 (modello WebML)

| # | Verifica | Esito atteso |
|---|----------|--------------|
| 3.1 | `UtentiUnit` (MultipleDetails) → tabella React | la tabella pubblica più istanze di `User` |
| 3.2 | Link Nuovo/Modifica verso pagine "non realizzate" | nel codice resi non funzionanti (pulsanti disabled) |
| 3.3 | Operazione `Delete(User)` con esiti OK/KO | delete OK ⇒ refresh lista; errore ⇒ stato di errore |
| 3.4 | Pagina landmark solo ADMIN | voce navbar condizionata a `role === 'ADMIN'` |

---

## 4. Controlli automatici (qualità)

| # | Comando | Esito atteso |
|---|---------|--------------|
| 4.1 | `npx nx build api` | success |
| 4.2 | `npx nx build ui` | success |
| 4.3 | `npx nx lint ui` | 0 error (solo warning preesistenti: `any`, emoji) |
| 4.4 | `npx nx lint @server/users` | ⚠️ unico errore = dipendenza **circolare preesistente** `@server/users ↔ @server/security`, non introdotta da questa consegna |

> Nota di sicurezza (fuori scope, ma utile saperlo all'orale): `POST /api/users` e la registrazione
> sono pubbliche e accettano `role`, quindi consentono di creare un ADMIN senza autenticazione
> (privilege escalation). La consegna riguarda la sola visualizzazione, ma è bene citarlo.
