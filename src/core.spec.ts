import {expect} from 'chai';
import {Core, CoreEventHandler} from './core';
import {EventQueue, CoreEvent} from './event-queue';
import {EventClass} from './event-class';

class Event implements CoreEvent {
}

class TestCore extends Core {
  constructor(eventQueue: EventQueue) {
    super(eventQueue);
  }


  dispatchEvent(event: CoreEvent) {
    super.dispatchEvent(event);
  }

  on<Event extends CoreEvent, Handler extends CoreEventHandler<Event>>(eventClass: EventClass<Event>,
                                                                       handler: Handler) {
    super.on(eventClass, handler);
  }
}

describe('Core', () => {

  let core: TestCore;
  let eventQueue: EventQueue;
  let sentEvents: CoreEvent[];

  beforeEach(() => {
    eventQueue = new EventQueue();
    core = new TestCore(eventQueue);
    sentEvents = [];
    eventQueue.event$.subscribe(event => sentEvents.push(event));
  });

  it('accepts events', () => {
    const event: Event = new Event();
    core.dispatchEvent(event);
    expect(sentEvents.length).to.equal(1);
    expect(sentEvents[0]).to.equal(event);
  });

  describe('when listening for events', () => {
    let event: Event = new Event();
    let caughtEvent: Event;
    beforeEach(() => {
      core.on(Event, e => caughtEvent = e);
      eventQueue.dispatch(event);
    });

    it('handles event', () => {
      expect(caughtEvent).to.equal(event);
    });
  });

});

