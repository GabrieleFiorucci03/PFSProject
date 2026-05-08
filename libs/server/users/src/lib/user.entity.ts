import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '@server/security';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: false})
    name: string;

    @Column({type:'varchar', length:320, nullable: false, unique: true})
    email: string;

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

