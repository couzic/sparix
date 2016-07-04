import {Store, Updater, Operation, OperationResult} from './store';
import {EventQueue, CoreEvent} from './event-queue';

class State {
  prop1: number;
  prop2: string;
  dateProp: Date;
  deepObject: {
    subProp1: number;
    subProp2: string;
  };
}

const initialProp1Value = 42;

const initialState: State = {
  prop1: initialProp1Value,
  prop2: 'Whatever',
  dateProp: new Date(),
  deepObject: {
    subProp1: initialProp1Value,
    subProp2: 'Sub Whatever'
  }
};

class Event implements CoreEvent {
}

class TestStore extends Store<State> {
  constructor(eventBus: EventQueue) {
    super(eventBus, initialState);
  }

  updateState(diff: any) {
    super.updateState(diff);
  }

  update(updater: Updater<State>) {
    super.update(updater);
  }

  execute(operation: Operation<State>) {
    super.execute(operation);
  }

  dispatch(eventProvider: (the: State) => CoreEvent) {
    super.dispatch(eventProvider);
  }

  applyResult(operationResult: OperationResult<State>) {
    super.applyResult(operationResult);
  }

}

describe('Store', () => {

  let store: TestStore;
  let state: State;
  let eventQueue: EventQueue;
  let sentEvents: CoreEvent[];

  beforeEach(() => {
    eventQueue = new EventQueue();
    store = new TestStore(eventQueue);
    store.state$.subscribe(newState => {
      state = newState;
    });
    sentEvents = [];
    eventQueue.event$.subscribe(event => sentEvents.push(event));
  });

  describe('initial state', () => {

    it('is immutable', () => {
      expect(() => state.prop1 = 24).toThrowError();
    });

  });

  describe('updated state', () => {
    beforeEach(() => store.updateState({prop1: 24}));

    it('is immutable', () => {
      expect(() => state.prop1 = 12).toThrowError();
    });

  });

  describe('.map()', () => {
    let prop1History;
    let deepObjectHistory;
    beforeEach(() => {
      prop1History = [];
      deepObjectHistory = [];
      store
        .map(s => s.prop1)
        .subscribe(prop1 => prop1History.push(prop1));
      store
        .map(s => s.deepObject)
        .subscribe(deepObj => deepObjectHistory.push(deepObj));
    });

    it('does not send subsequent change notifications with same value', () => {
      store.updateState({});
      expect(prop1History.length).toEqual(1);
    });

    it('does not send subsequent change notifications with same object', () => {
      store.updateState({prop1: 12});
      expect(deepObjectHistory.length).toEqual(1);
    });
  });

  it('accepts updaters', () => {
    store.update(s => ({prop1: s.prop1 + 1}));
    expect(state.prop1).toEqual(43);
  });

  it('accepts event providers', () => {
    const event: Event = new Event();
    store.dispatch(s => event);
    expect(sentEvents.length).toEqual(1);
    expect(sentEvents[0]).toBe(event);
  });

  it('accepts operations', () => {
    const event: Event = new Event();
    store.execute(s => ({
      update: {prop1: s.prop1 + 2},
      event
    }));
    expect(state.prop1).toEqual(44);
    expect(sentEvents.length).toEqual(1);
    expect(sentEvents[0]).toBe(event);
  });

  it('accepts operation results', () => {
    const event: Event = new Event();
    store.applyResult({
      update: {prop1: 124},
      event
    });
    expect(state.prop1).toEqual(124);
    expect(sentEvents.length).toEqual(1);
    expect(sentEvents[0]).toBe(event);
  });

  describe('when two successive updaters apply same diff', () => {
    beforeEach(() => {
      store.update(s => ({prop2: 'updated'}));
      store.update(s => ({prop2: 'updated'}));
      store.update(s => ({prop1: 0}));
    });

    it('the following updater receives a state', () => {
      store.update(s => {
        expect(s).toBeDefined();
        return s;
      });
    });

    it('stores updates from all updaters', () => {
      expect(state.prop2).toBeDefined();
    });

  });

  it('stores Date', () => {
    const now = new Date();
    store.updateState({dateProp: () => now});
    expect(state.dateProp).toEqual(now);
  });

});

