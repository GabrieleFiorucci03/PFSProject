import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '@server/users';

/**
 * Profilo segretario (tabella `secretariats`). Come il docente, è legato 1-a-1 a
 * un `UserEntity` (cascade alla cancellazione dell'utente). Non possiede
 * insegnamenti o appelli: la segreteria amministra le risorse altrui.
 */
@Entity('secretariats')
export class SecretariatEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    secretariatId: number;

    /** Account utente collegato (eager: sempre caricato per nome/email/ruolo). */
    @OneToOne(() => UserEntity, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn()
    user: UserEntity;
}
