import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '@server/security';

/**
 * Entità account utente (tabella `users`). È la base dell'autenticazione: docenti
 * e segretari hanno un `UserEntity` più un profilo dedicato (TeacherEntity /
 * SecretariatEntity). L'email è unica e funge da identificativo per il login.
 */
@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: false})
    name: string;

    /** Email univoca: identificativo di login (vincolo UNIQUE sul DB). */
    @Column({type:'varchar', length:320, nullable: false, unique: true})
    email: string;

    /** Hash bcrypt della password. `@Exclude()` la tiene fuori dalle risposte serializzate. */
    @Exclude()
    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.DOCENTE
    })
    role: UserRole;
}

