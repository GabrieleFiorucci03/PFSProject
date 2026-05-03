import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

type PgError = {
      code?: string;
      detail?: string;
      table?: string;
      column?: string;
      constraint?: string;
  };

function formatMessage(title: string, error: PgError, fallback: string): string {
    const parts = [title];
    if (error.constraint) parts.push(`constraint: ${error.constraint}`);
    if (error.table) parts.push(`tabella: ${error.table}`);
    if (error.column) parts.push(`colonna: ${error.column}`);
    if (error.detail) parts.push(`dettaglio: ${error.detail}`);
    else parts.push(fallback);
    return parts.join(' - ');
}

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

export function handleDatabaseError(error: unknown, fallbackMessage = 'Errore del database'): never {
    if (error instanceof QueryFailedError) {
        const e = error.driverError as PgError;
        const factory = e.code ? dbErrorFactories[e.code] : undefined;
        if (factory) throw factory(e);
    }
    throw new InternalServerErrorException(fallbackMessage);
}

