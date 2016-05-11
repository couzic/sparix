import {Store, Updater, Operation, OperationResult} from './store';
import {EventBus, CoreEvent} from './event-bus';

class State {
  prop1: number;
  prop2: string;
}

const initialProp1Value = 42;

const initialState: State = {
  prop1: initialProp1Value,
  prop2: 'Whatever'
};

class Event implements CoreEvent {
}

class TestStore extends Store<State> {
  constructor(eventBus: EventBus) {
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

  dispatchEvent(event: CoreEvent) {
    super.dispatchEvent(event);
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
  let stateHistory: State[];
  let eventBus: EventBus;
  let sentEvents: CoreEvent[];

  beforeEach(() => {
    stateHistory = [];
    eventBus = new EventBus();
    store = new TestStore(eventBus);
    store.state$.subscribe(newState => {
      state = newState;
      stateHistory.push(newState);
    });
    sentEvents = [];
    eventBus.event$.subscribe(event => sentEvents.push(event));
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

  describe('when an update does not change state values', () => {
    beforeEach(() => store.updateState({prop1: initialProp1Value}));

    it('does not send state update notifications', () => {
      expect(stateHistory.length).toEqual(1);
    });
  });

  it('accepts updaters', () => {
    store.update(s => ({prop1: s.prop1 + 1}));
    expect(state.prop1).toEqual(43);
  });

  it('accepts events', () => {
    const event: Event = new Event();
    store.dispatchEvent(event);
    expect(sentEvents.length).toEqual(1);
    expect(sentEvents[0]).toBe(event);
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

});

