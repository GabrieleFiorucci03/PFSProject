import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

/** Forma essenziale di un errore del driver PostgreSQL (campi che ci interessano). */
type PgError = {
      code?: string;
      detail?: string;
      table?: string;
      column?: string;
      constraint?: string;
  };

/** Compone un messaggio leggibile unendo titolo, vincolo/tabella/colonna/dettaglio se presenti. */
function formatMessage(title: string, error: PgError, fallback: string): string {
    const parts = [title];
    if (error.constraint) parts.push(`constraint: ${error.constraint}`);
    if (error.table) parts.push(`tabella: ${error.table}`);
    if (error.column) parts.push(`colonna: ${error.column}`);
    if (error.detail) parts.push(`dettaglio: ${error.detail}`);
    else parts.push(fallback);
    return parts.join(' - ');
}

/**
 * Mappa "codice errore PostgreSQL → eccezione HTTP NestJS". Traduce i fallimenti
 * a livello DB (violazioni di vincoli, deadlock, ecc.) in risposte HTTP sensate.
 */
const dbErrorFactories: Record<string, (e: PgError) => Error> = {
    '23505': (e) =>
        new ConflictException(
            formatMessage(
                'Violazione di unicità',
                e,
                'Esiste già un record con questi valori univoci',
            ),
        ),

    '23502': (e) =>
        new UnprocessableEntityException(
            formatMessage(
                'Campo obbligatorio mancante',
                e,
                `Il campo ${e.column ?? 'richiesto'} non può essere null`,
            ),
        ),

    '23503': (e) =>
        new BadRequestException(
            formatMessage(
                'Violazione di foreign key',
                e,
                'La relazione richiesta non è valida',
            ),
        ),

    '23514': (e) =>
        new UnprocessableEntityException(
            formatMessage(
                'Violazione di check constraint',
                e,
                'I dati non rispettano una regola del database',
            ),
        ),

    '23P01': (e) =>
        new ConflictException(
            formatMessage(
                'Violazione di exclusion constraint',
                e,
                'Il record è in conflitto con un altro record esistente',
            ),
        ),

    '40001': () =>
        new ServiceUnavailableException('Conflitto concorrente sul database. Riprova.'),

    '40P01': () =>
        new ServiceUnavailableException('Deadlock rilevato sul database. Riprova.'),
};

/**
 * Punto unico di gestione degli errori di scrittura sul DB nei service. Se l'errore
 * è una `QueryFailedError` con un codice noto, lancia l'eccezione HTTP corrispondente;
 * altrimenti un 500 generico con `fallbackMessage`. Tipo di ritorno `never`: termina
 * sempre lanciando, così si può usare come ultima istruzione di un `catch`.
 */
export function handleDatabaseError(error: unknown, fallbackMessage = 'Errore del database'): never {
    if (error instanceof QueryFailedError) {
        const e = error.driverError as PgError;
        const factory = e.code ? dbErrorFactories[e.code] : undefined;
        if (factory) throw factory(e);
    }
    throw new InternalServerErrorException(fallbackMessage);
}

