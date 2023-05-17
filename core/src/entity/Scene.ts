import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Event } from "./Event";

@Entity()
export class Scene {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    location: string

    @ManyToOne(() => Event, (event) => event.scenes)
    event: Event
}
