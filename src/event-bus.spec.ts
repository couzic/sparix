import {EventBus, CoreEvent} from './event-bus';

class Event implements CoreEvent {
  public val = 42;
}

describe('EventBus', () => {

  let eventBus: EventBus;
  let dispatchedEvents: CoreEvent[];

  beforeEach(() => {
    eventBus = new EventBus();
    dispatchedEvents = [];
    eventBus.event$.subscribe(event => dispatchedEvents.push(event));
  });

  it('dispatches single event', () => {
    const event = new Event();
    eventBus.dispatch(event);
    expect(dispatchedEvents.length).toEqual(1);
    expect(dispatchedEvents[0]).toBe(event);
  });

  it('dispatches multiple events', () => {
    const first = new Event();
    const second = new Event();
    eventBus.dispatch(first);
    eventBus.dispatch(second);
    expect(dispatchedEvents.length).toEqual(2);
    expect(dispatchedEvents[0]).toBe(first);
    expect(dispatchedEvents[1]).toBe(second);
  });

  it('dispatches event to every subscriber before dispatching another event', () => {
    const first = new Event();
    const second = new Event();
    eventBus.event$.subscribe(event => {
      if (event === first) eventBus.dispatch(second);
    });
    eventBus.dispatch(first);
    expect(dispatchedEvents.length).toEqual(2);
    expect(dispatchedEvents[0]).toBe(first);
    expect(dispatchedEvents[1]).toBe(second);
  });

  describe('dispatched event', () => {
    let event = new Event();
    beforeEach(() => eventBus.dispatch(event));

    it('is immutable', () => {
      expect(() => (<Event>dispatchedEvents[0]).val = 0).toThrowError();
    });
  });

});


