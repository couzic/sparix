import {expect} from 'chai';
import {EventQueue, CoreEvent} from './event-queue';

class Event implements CoreEvent {
  public val = 42;
}

class OtherEvent implements CoreEvent {
}

describe('EventBus', () => {

  let eventQueue: EventQueue;
  let dispatchedEvents: CoreEvent[];

  beforeEach(() => {
    eventQueue = new EventQueue();
    dispatchedEvents = [];
    eventQueue.event$.subscribe(event => dispatchedEvents.push(event));
  });

  it('dispatches single event', () => {
    const event = new Event();
    eventQueue.dispatch(event);
    expect(dispatchedEvents.length).to.equal(1);
    expect(dispatchedEvents[0]).to.equal(event);
  });

  it('dispatches multiple events', () => {
    const first = new Event();
    const second = new Event();
    eventQueue.dispatch(first);
    eventQueue.dispatch(second);
    expect(dispatchedEvents.length).to.equal(2);
    expect(dispatchedEvents[0]).to.equal(first);
    expect(dispatchedEvents[1]).to.equal(second);
  });

  it('dispatches event to every subscriber before dispatching another event', () => {
    const first = new Event();
    const second = new Event();
    eventQueue.event$.subscribe(event => {
      if (event === first) eventQueue.dispatch(second);
    });
    eventQueue.dispatch(first);
    expect(dispatchedEvents.length).to.equal(2);
    expect(dispatchedEvents[0]).to.equal(first);
    expect(dispatchedEvents[1]).to.equal(second);
  });

  describe('dispatched event', () => {
    let event = new Event();
    beforeEach(() => eventQueue.dispatch(event));

    it('is immutable', () => {
      expect(() => (<Event>dispatchedEvents[0]).val = 0).to.throw();
    });
  });

  describe('.filter()', () => {
    let filteredEvents: CoreEvent[];
    beforeEach(() => {
      filteredEvents = [];
    });

    it('returns a filtered stream of events', () => {
      eventQueue.filter(Event)
        .subscribe(event => filteredEvents.push(event));
      eventQueue.dispatch(new Event());
      eventQueue.dispatch(new OtherEvent());
      expect(filteredEvents.length).to.equal(1);
    });

    it('can filter Events which have parametrized constructor', () => {
      class SomeEvent {
        constructor(val: number) {
        }
      }
      eventQueue.filter(SomeEvent);
    });

  });

});


