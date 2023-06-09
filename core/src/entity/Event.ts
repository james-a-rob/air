import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Scene } from "./Scene";
import { StreamStatus } from "../enums";

@Entity()
export class Event {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    status: StreamStatus

    @Column()
    url: string

    @Column({ type: 'boolean', default: false })
    loop: boolean

    @OneToMany(() => Scene, (scene) => scene.event, { cascade: true })
    scenes: Scene[]

}
