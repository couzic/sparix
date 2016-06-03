import {Subscriber} from 'rxjs/Subscriber';
import {Observable} from 'rxjs/Observable';
import {freeze} from './freeze';
import {Observer} from 'rxjs/Rx';
import {EventClass} from './event-class';

export interface CoreEvent {
}

export class EventQueue implements Observer<CoreEvent> {

  logging: boolean = false;

  private output$: Observable<CoreEvent>;
  private subscribers: Subscriber<CoreEvent>[] = [];
  private dispatching: boolean = false;
  private queuedEvents: CoreEvent[] = [];

  constructor() {
    this.output$ = Observable.create(subscriber => {
      this.subscribers.push(subscriber);
    });
  }

  next(event: CoreEvent) {
    this.dispatch(event);
  }

  error(err: any) {
    console.error(err);
  }

  complete() {
  }

  dispatch(event: CoreEvent) {
    freeze(event);
    if (this.dispatching) {
      this.queuedEvents.push(event);
    } else {
      if (this.logging) {
        console.info('Dispatching Event:', event);
      }
      this.dispatching = true;
      this.subscribers.forEach(subscriber => {
        subscriber.next(event);
      });
      this.dispatching = false;
      if (this.queuedEvents.length > 0) {
        this.dispatch(this.queuedEvents.pop());
      }
    }
  }

  get event$() {
    return this.output$;
  }

  filter<Event extends CoreEvent>(eventClass: EventClass<Event>): Observable<Event> {
    return <Observable<Event>> this.event$
      .filter(event => event.constructor === eventClass);
  }

}
