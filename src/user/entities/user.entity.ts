import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column({
        type: 'text'
    })
    password: string;

    @Column({ name: "is_active", default: true })
    isActive: boolean;

    @CreateDateColumn({name: "created_at"})
    createdAt: string;

    @UpdateDateColumn({name:"updated_at"})
    updatedAt: string;

    @DeleteDateColumn({name: "deleted_at"})
    deletedAt: string;
}
