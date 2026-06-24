/**
 * Ruoli applicativi degli utenti del sistema.
 * - DOCENTE: professore titolare di insegnamenti; pianifica i propri appelli.
 * - SEGRETERIA: agisce da amministratore (gestisce corsi, sessioni, docenti, ecc.).
 *
 * Vive in @server/security (e non in @server/users) per rompere una dipendenza
 * circolare tra i due moduli.
 */
export enum UserRole {
    DOCENTE = 'DOCENTE',
    SEGRETERIA = 'SEGRETERIA'
}
