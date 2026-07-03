# Esercizio 1 — Modello ipertestuale WebML
## Pagina di visualizzazione degli utenti registrati

> Progettazione model-driven dei contenuti ipertestuali (WebML).
> Riferimenti: slide L9 (notazione) e L10 (running example "Area libri" + mapping all'implementazione).

---

## 1. Premesse e requisiti

Dall'analisi dei requisiti (consegna):

- Funzionalità di **gestione utenti**, limitata alla **sola visualizzazione** degli utenti registrati.
- Accesso consentito **solo agli amministratori** → la pagina appartiene alla **site view privata dell'amministratore** (area *privata*: accesso tramite autenticazione + autorizzazione di ruolo `ADMIN`).
- La pagina mostra una **tabella** con `id`, `nome` (`name`), `email`, `ruolo` (`role`).
- Sono presenti i **pulsanti** per: inserimento nuovo utente, modifica utente, cancellazione (con conferma).
- Le pagine di inserimento/modifica **non** sono realizzate (i relativi link puntano a pagine non ancora sviluppate). La cancellazione è opzionale.

**Entità coinvolta** (dal modello dei dati): `User(id, name, email, passwordHash, role)`.
Nella pubblicazione ipertestuale l'attributo `passwordHash` **non** viene mai esposto.

---

## 2. Progetto coarse — Area Utenti

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

---

## 3. Progetto dettagliato — suddivisione in pagine

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

---

## 4. Specifica di dettaglio della pagina «Lista Utenti»

### 4.1 Diagramma WebML

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

### 4.2 View component — `UtentiUnit` (MultipleDetails)

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

### 4.3 Operazione — `Delete(User)` *(opzionale)*

| Proprietà         | Valore                                                              |
|-------------------|---------------------------------------------------------------------|
| Tipo              | **Delete** operation unit                                           |
| Entità            | `User`                                                              |
| Normal link (in)  | dalla `UtentiUnit`, trasporta lo `userID` dell'utente da eliminare  |
| Link OK (verde)   | torna a **Lista Utenti** (ricalcolo/refresh della MultipleDetails)  |
| Link KO (rosso)   | va a **ErrorPage**                                                  |

La conferma ("con conferma") è modellata come interazione che precede l'attivazione del
*normal link* verso l'operazione `Delete`.

### 4.4 Link uscenti dalla pagina

| Pulsante        | Tipo di link                         | Destinazione        | Contesto trasportato |
|-----------------|--------------------------------------|---------------------|----------------------|
| **Nuovo utente** | link **non contestuale**            | pagina Crea Utente  | nessuno              |
| **Modifica**    | link **contestuale**                 | pagina Modifica Utente | `userID` (→ `User[ID==?]`) |
| **Elimina**     | **normal link** verso operazione Delete | Delete(User)     | `userID`             |

---

## 5. Layout di pagina (navbar + utente corrente)

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

---

## 6. Mapping verso l'implementazione (coerente con L10)

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

> Gli esercizi 2 e 3 realizzano rispettivamente la rotta di backend (`GET /api/users`) e il
> componente React della pagina *Lista Utenti* qui progettata.
