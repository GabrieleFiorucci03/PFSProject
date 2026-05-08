import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '@server/users';

@Entity('secretariats')
export class SecretariatEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    secretariatId: number;

    @OneToOne(() => UserEntity, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn()
    user: UserEntity;
}
