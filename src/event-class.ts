import {CoreEvent} from './event-queue'

export interface EventClass<Event extends CoreEvent> {
   new (...args: any[]): Event
}
