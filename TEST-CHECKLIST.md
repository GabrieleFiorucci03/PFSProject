# Checklist di verifica del sistema — Pianificazione Appelli

> Lista di test derivata dalle **entità del DB** e dalle **regole di dominio** presenti nei service.
> Obiettivo: verificare che tutto funzioni e capire se le regole vanno aggiunte/modificate.
> Account, password e dati provengono dallo script di seed (`npm run seed`).

---

## 0. Dati presenti nel database (seed)

### Account (password per tutti: `Password1!`)

| Ruolo | Nome | Email |
|---|---|---|
| SEGRETERIA | Gabriele Fiorucci | `gabriele.fiorucci@unibs.it` |
| DOCENTE | Devis Bianchini | `devis.bianchini@unibs.it` |
| DOCENTE | Mario Rossi | `mario.rossi@unibs.it` |

### Corsi di laurea
- **Ingegneria Informatica** — 3 anni — Dip. di Ingegneria dell'Informazione
- **Ingegneria Civile** — 3 anni — Dip. di Ingegneria Civile

### Insegnamenti (materie)
| Materia | Anno | CFU | Corso | Docente |
|---|---|---|---|---|
| Programmazione Web | 3 | 6 | Informatica | Devis |
| Basi di Dati | 2 | 9 | Informatica | Devis |
| Scienza delle Costruzioni | 2 | 9 | Civile | Mario |

### Sessioni d'esame (⚠️ le date sono **relative al giorno in cui hai lanciato il seed** = `base`)
| Sessione | Sessione (start–end) | Pianificazione (start–end) | Stato |
|---|---|---|---|
| Sessione Invernale 2025 | base−180 → base−160 | base−220 → base−185 | **passata**, pianificazione chiusa |
| Sessione Estiva 2026 | base+15 → base+45 | base−5 → base+10 | **corrente**, pianificazione APERTA oggi |
| Sessione Autunnale 2026 | base+90 → base+110 | base+60 → base+80 | **futura** |

> Esempio con `base = 2026-06-24` (data odierna): Estiva = sessione 09/07→08/08, pianificazione 19/06→04/07.
> **Per testare il calendario in modo prevedibile**: lancia il seed, annota il `base`, poi sposta la data del PC dentro/fuori queste finestre. Le finestre NON si spostano col PC: solo "oggi" cambia rispetto a esse.

### Esami già pianificati (2 per sessione, in giorni feriali)
- Invernale: Programmazione Web (~base−175), Scienza delle Costruzioni (~base−170)
- Estiva: Programmazione Web (~base+20), Basi di Dati (~base+23)
- Autunnale: Scienza delle Costruzioni (~base+95), Programmazione Web (~base+98)

---

## 1. Autenticazione e ruoli

- [ ] Login con `gabriele.fiorucci@unibs.it` / `Password1!` → entra come SEGRETERIA
- [ ] Login con `devis.bianchini@unibs.it` / `Password1!` → entra come DOCENTE
- [ ] Login con **email inesistente** → 401 (stesso messaggio generico)
- [ ] Login con email valida ma **password sbagliata** → 401 (NON deve dire "password errata", no user enumeration)
- [ ] Accesso a una rotta protetta **senza token** → 401
- [ ] DOCENTE che chiama un endpoint SEGRETERIA (es. `GET /api/exams`, `GET /api/subjects`, `GET /api/teachers`) → 403
- [ ] `POST /api/auth/register` e `POST /api/users` come DOCENTE → 403 (sono SEGRETERIA-only e non vanno usati dal frontend)

---

## 2. Corsi di laurea (DegreeCourse) — SEGRETERIA

- [ ] Creazione corso nuovo (es. "Ingegneria Gestionale", 3 anni) → ok
- [ ] Creazione con **nome duplicato esatto** ("Ingegneria Informatica") → 409
- [ ] Creazione con nome che differisce solo per **maiuscole/spazi** ("ingegneria informatica", "Ingegneria  Informatica") → 409 (unicità case/spazi-insensitive)
- [ ] Modifica nome di un corso in uno già esistente → 409
- [ ] **Eliminazione di un corso con materie collegate** (es. Informatica) → **bloccata con 409** e messaggio chiaro ("Impossibile eliminare il corso di laurea: ha N insegnamenti collegati…"). Verifica che NON cancelli a cascata le materie.
- [ ] Eliminazione di un corso **senza** materie → ok

---

## 3. Docenti (Teacher) — creazione SEGRETERIA, profilo self-service

- [ ] SEGRETERIA crea un docente nuovo (nome + email + password) → ok, ruolo forzato DOCENTE
- [ ] Creazione docente con **email già usata** → 409 e **nessun utente orfano** rimane (rollback)
- [ ] Due docenti con **stesso nome** ma email diverse → ammesso (l'unicità è solo sull'email)
- [ ] DOCENTE apre la propria **area personale** (`/teachers/me`) → vede il proprio profilo
- [ ] DOCENTE modifica il proprio **nome** → ok
- [ ] DOCENTE tenta di modificare la propria **email** → 403 ("Non puoi modificare la tua email")
- [ ] DOCENTE **cambia la propria password** → salvato; il **vecchio** login NON funziona più, il **nuovo** sì (verifica con logout/login). Password debole (no maiuscola/simbolo o < 8) → 400
- [ ] DOCENTE tenta di modificare/eliminare **un altro docente** → 403
- [ ] SEGRETERIA modifica/elimina **qualunque** docente → ok
- [ ] **Eliminazione di un docente che possiede materie/esami** (es. Devis) → **bloccata con 409** e messaggio chiaro ("Impossibile eliminare il docente: ha N insegnamenti e M appelli collegati…"). Verifica che non rimuova materie/esami/utente a cascata.

---

## 4. Segreterie (Secretariat) — self-only

- [ ] SEGRETERIA crea una **seconda** segreteria (serve per i test seguenti) → ok
- [ ] Segretario A modifica il proprio nome → ok
- [ ] Segretario A tenta di modificare la propria email → 403
- [ ] Segretario A **cambia la propria password** → salvato; vecchia password non valida più, nuova sì (logout/login). Password debole → 400
- [ ] Segretario A tenta di modificare/eliminare **Segretario B** → 403 (self-only, anche tra segreterie!)
- [ ] Segretario elimina **il proprio** account → ok

---

## 5. Insegnamenti (Subject) — SEGRETERIA crea, DOCENTE vede le proprie

- [ ] Creazione materia valida (corso + docente esistenti) → ok
- [ ] Creazione con **corso inesistente** o **docente inesistente** → 404
- [ ] **anno = 0** o **anno > durata del corso** (es. anno 4 su corso di 3 anni) → 400
- [ ] anno valido al limite (anno = 3 su corso di 3) → ok
- [ ] Nome duplicato **nello stesso corso** (anche solo maiuscole/spazi diversi) → 409
- [ ] Stesso nome materia ma in **un altro corso** → ammesso (unicità è per coppia nome+corso)
- [ ] DOCENTE chiama `/subjects/mine` → vede **solo** le proprie materie
- [ ] DOCENTE chiama `GET /subjects` (lista completa) → 403
- [ ] **Eliminazione materia con esami collegati** → **bloccata con 409** e messaggio chiaro ("Impossibile eliminare l'insegnamento: ha N appelli collegati…")

---

## 6. Sessioni d'esame (ExamSession) — SEGRETERIA

- [ ] Creazione sessione valida → ok
- [ ] Nome duplicato (anche maiuscole/spazi diversi) → 409
- [ ] **startDate ≥ endDate** → 400
- [ ] **planningStartDate ≥ planningEndDate** → 400
- [ ] **planningEndDate > startDate** (la pianificazione finisce dopo l'inizio sessione) → 400
- [ ] Caso limite valido: `planningEndDate == startDate` → ok
- [ ] Modifica parziale (solo una data) che rende l'insieme incoerente → 400 (la validazione usa i valori esistenti per i campi non passati)
- [ ] **Periodi-sessione non sovrapponibili**: creare/modificare una sessione il cui `[startDate, endDate]` si sovrappone a un'altra → **409** (col nome della sessione in conflitto)
- [ ] **Finestre di pianificazione sovrapponibili**: una nuova sessione con periodo distinto ma finestra di pianificazione sovrapposta a un'altra → **ok** (consentito)
- [ ] **Eliminazione di una sessione con appelli collegati** → **bloccata con 409** e messaggio chiaro ("Impossibile eliminare la sessione: ha N appelli collegati…")
- [ ] Eliminazione di una sessione **senza** appelli → ok

---

## 7. Esami / Appelli (Exam) — il cuore delle regole

> Creazione: **solo DOCENTE**, docente forzato all'utente corrente.
> Modifica/eliminazione: SEGRETERIA su tutti, DOCENTE solo i propri.

### 7a. Creazione (come DOCENTE, con pianificazione APERTA — vedi sez. 9)
- [ ] Devis crea un appello per una **propria** materia in giorno feriale dentro la sessione corrente → ok
- [ ] Devis tenta di creare un appello per **Scienza delle Costruzioni** (materia di Mario) → 403 ("solo per le tue materie")
- [ ] **startHour ≥ endHour** (es. 11–9, o 10–10) → 400
- [ ] Data **fuori dall'intervallo della sessione** (prima dello start o dopo l'end) → 400
- [ ] Data in un **weekend** (sabato/domenica dentro la sessione) → 400
- [ ] **Conflitto corso+anno+giorno**: stessa data di un altro esame dello **stesso corso e anno** (anche materia diversa) → 409. ⚠️ Verifica se è il comportamento voluto (vedi sez. 10).
- [ ] **Stessa materia due volte nella stessa sessione** → 409
- [ ] Vincolo DB `UNIQUE(date, subject)`: stessa materia + stessa data → 409

### 7b. Modifica / eliminazione
- [ ] DOCENTE modifica un **proprio** esame (dentro la finestra di pianificazione) → ok
- [ ] DOCENTE tenta di modificare/eliminare un esame di **un altro docente** → 403
- [ ] DOCENTE in modifica tenta di spostare l'esame su una materia **non sua** → 403
- [ ] SEGRETERIA modifica/elimina **qualunque** esame → ok
- [ ] SEGRETERIA modifica un esame **anche fuori dalla finestra di pianificazione** → ok (la SEGRETERIA bypassa il controllo finestra)
- [ ] Modifica che genera un conflitto (sposta su una data già occupata dallo stesso corso+anno) → 409

### 7c. Visibilità
- [ ] `GET /exams` (lista completa) come SEGRETERIA → ok; come DOCENTE → 403
- [ ] `GET /exams/mine` come DOCENTE → solo i propri esami
- [ ] Nessuna risposta espone `passwordHash` del docente

---

## 8. Calendario — vista DOCENTE (dashboard `/`)

> Richiede una materia propria selezionata. I colori riflettono SOLO le regole BE.

- [ ] Senza materia selezionata: i giorni mostrano **viola** (finestra pianificazione) e **blu** (giorni di sessione)
- [ ] Selezionando una materia: nei giorni di **sessione** i giorni feriali liberi diventano **verdi**, gli altri **rossi**
- [ ] Giorno **weekend** dentro la sessione → rosso
- [ ] Giorno con un esame già esistente per quel **corso+anno** → rosso
- [ ] Materia **già pianificata** in quella sessione → tutti i giorni di quella sessione rossi per quella materia
- [ ] Click su giorno **verde** → apre `/exams/new` con data, materia e sessione **precompilate**
- [ ] Click su giorno **rosso/non disponibile** → nessuna azione
- [ ] La creazione dal form precompilato va a buon fine → l'esame appare come evento sul calendario

---

## 9. Calendario e finestra di pianificazione — TEST CON CAMBIO DATA DEL PC ⏰

> Questi test verificano la regola: **un DOCENTE può creare/modificare un appello solo se OGGI è dentro `[planningStartDate, planningEndDate]` della sessione.**
> Sposta la data di Windows e ricarica l'app (e rifai login se il token scade).

- [ ] **PC dentro la finestra di pianificazione** della Sessione Estiva (base−5 → base+10): DOCENTE crea un appello in quella sessione → ok. Sul calendario i giorni feriali sono verdi.
- [ ] **PC dopo la chiusura della pianificazione** (es. base+11, finestra Estiva chiusa): DOCENTE crea/modifica appello in quella sessione → 403 ("Puoi pianificare esami solo tra …"). Sul calendario i giorni di sessione diventano rossi.
- [ ] **PC prima dell'apertura della pianificazione** (es. base−10): stessa cosa → 403, giorni rossi
- [ ] **PC dentro la finestra della Sessione Autunnale** (base+60 → base+80): la pianificazione di Autunnale si apre → DOCENTE può pianificare lì
- [ ] **SEGRETERIA fuori da ogni finestra**: può comunque modificare gli esami (nessun blocco temporale)
- [ ] **Dashboard SEGRETERIA**: spostando il PC dentro l'intervallo di una sessione, il contatore "Sessioni in corso" aumenta
- [ ] **Dashboard SEGRETERIA**: click su un giorno → mostra gli esami di quel giorno con docente e orario
- [ ] Verifica che NON ci siano sfasamenti di **fuso orario** sui giorni (un esame del lunedì non deve comparire di domenica/martedì)

---

## 10. Osservazioni sulle regole di dominio (da validare / possibili modifiche)

Punti da decidere se sono voluti o vanno cambiati:

1. **Un solo esame al giorno per corso+anno.** La regola di conflitto blocca *qualsiasi* secondo esame nello stesso giorno per lo stesso corso e anno, anche di **materie diverse**. È pensato per non far accavallare esami agli studenti di uno stesso anno — confermare che sia il comportamento desiderato (potrebbe essere troppo restrittivo o, al contrario, voler considerare la fascia oraria).
2. **Nessun controllo di sovrapposizione di aula/orario.** `roomType` è un *tipo* di aula, non un'aula specifica: due esami di corsi diversi nello stesso giorno e fascia oraria con lo stesso `roomType` sono ammessi. Se serve evitare il doppio uso fisico di un'aula, manca una regola.
3. **`startHour`/`endHour` interi 0–24 senza vincoli reali.** È possibile un esame 0–24 (intera giornata) o 7–8. Valutare un intervallo orario sensato (es. 8–20) e durata minima/massima.
4. **DOCENTE bloccato sui propri esami a finestra chiusa.** Dopo la chiusura della pianificazione, il docente non può più modificare/eliminare i **propri** esami (solo la SEGRETERIA può). Confermare se è voluto o se il docente dovrebbe poter correggere fino all'inizio sessione.
5. ✅ **Eliminazioni bloccate da relazioni — messaggi chiari (FATTO).** Corso/Docente/Insegnamento/Sessione con elementi collegati ora restituiscono un **409 con messaggio dedicato** (controllo proattivo nei service), invece del vecchio 400 generico da violazione FK.
6. **Utenti "orfani" via `/auth/register` e `/users`.** Restano endpoint che creano un User senza profilo. Anche se non usati dal frontend, valutare se rimuoverli o documentarli per evitare account incoerenti.
7. **Self-only tra segreterie.** Una SEGRETERIA non può modificare/eliminare un'altra segreteria. Se la segreteria è "admin", forse dovrebbe poter gestire anche gli altri account di segreteria — da decidere.

---

## Come rigenerare i dati
```bash
npm run seed     # idempotente: riusa account/corsi/sessioni esistenti
```
Per partire pulito, svuota le tabelle (o ricrea il DB) e rilancia il seed annotando il nuovo `base`.
