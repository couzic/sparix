import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/share'
import {CoreEvent, EventQueue} from './event-queue'
import {EventClass} from './event-class'

export interface CoreEventHandler<Event extends CoreEvent> {
   (event: Event): void
}

export class Core {

   private eventHandlers = new Map<EventClass<any>, CoreEventHandler<any>>()

   constructor(private eventQueue?: EventQueue) {
      if (eventQueue) {
         eventQueue.event$.subscribe(event => this.handleEvent(event))
      }
   }

   protected dispatchEvent(event: CoreEvent) {
      this.eventQueue && this.eventQueue.dispatch(event)
   }

   protected on<Event extends CoreEvent, Handler extends CoreEventHandler<Event>>(eventClass: EventClass<Event>,
                                                                                  handler: Handler) {
      this.eventHandlers.set(eventClass, handler)
   }

   private handleEvent<Event extends CoreEvent>(event: Event): void {
      const handler: CoreEventHandler<Event> = this.eventHandlers.get(<EventClass<Event>> event.constructor) as CoreEventHandler<Event>
      if (handler) {
         handler(event)
      }
   }
}
