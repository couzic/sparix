import {expect} from 'chai';
import {Store, DiffProvider, Operation, OperationResult, FutureUpdater, Diff} from './store';
import {EventQueue, CoreEvent} from './event-queue';
import {Observable, Subject} from 'rxjs';

class State {
  prop1: number;
  prop2: string;
  dateProp: Date;
  deepObject: {
    subProp1: number;
    subProp2: string;
  };
  arrayProp: string[];
}

const initialProp1Value = 42;

const initialState: State = {
  prop1: initialProp1Value,
  prop2: 'Whatever',
  dateProp: new Date(),
  deepObject: {
    subProp1: initialProp1Value,
    subProp2: 'Sub Whatever'
  },
  arrayProp: ['1', '2', '3']
};

class Event implements CoreEvent {
}

class TestStore extends Store<State> {
  constructor(eventQueue?: EventQueue) {
    super(initialState, eventQueue);
  }

  updateState(diff: Diff<State>) {
    super.updateState(diff);
  }

  update(updater: DiffProvider<State>) {
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

  updateStateOnce(diff$: Observable<Object>) {
    super.updateStateOnce(diff$);
  }

  updateStateMany(diff$: Observable<Object>) {
    super.updateStateMany(diff$);
  }

  updateMany(updater$: FutureUpdater<State>) {
    super.updateMany(updater$);
  }

  updateOnce(updater$: FutureUpdater<State>) {
    super.updateOnce(updater$);
  }
}

describe('Store with no eventQueue', () => {
  it('can be instantiated', () => {
    new TestStore()
  })
});

describe('Store', () => {

  let store: TestStore;
  let state: State;
  let stateTransitions: State[];
  let eventQueue: EventQueue;
  let sentEvents: CoreEvent[];

  beforeEach(() => {
    eventQueue = new EventQueue();
    store = new TestStore(eventQueue);
    stateTransitions = [];
    store.state$.subscribe(newState => {
      state = newState;
      stateTransitions.push(newState);
    });
    sentEvents = [];
    eventQueue.event$.subscribe(event => sentEvents.push(event));
  });

  describe('initial state', () => {

    it('is immutable', () => {
      expect(() => state.prop1 = 24).to.throw();
    });

  });

  describe('updated state', () => {
    beforeEach(() => store.updateState({prop1: 24}));

    it('is immutable', () => {
      expect(() => state.prop1 = 12).to.throw();
    });

  });

  describe('.map()', () => {
    let prop1History: number[];
    let deepObjectHistory: Array<{
      subProp1: number;
      subProp2: string;
    }>;
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
      expect(prop1History.length).to.equal(1);
    });

    it('does not send subsequent change notifications with same object', () => {
      store.updateState({prop1: 12});
      expect(deepObjectHistory.length).to.equal(1);
    });
  });

  it('accepts updaters', () => {
    store.update(s => ({prop1: s.prop1 + 1}));
    expect(state.prop1).to.equal(43);
  });

  it('accepts event providers', () => {
    const event: Event = new Event();
    store.dispatch(s => event);
    expect(sentEvents.length).to.equal(1);
    expect(sentEvents[0]).to.equal(event);
  });

  it('accepts operations', () => {
    const event: Event = new Event();
    store.execute(s => ({
      update: {prop1: s.prop1 + 2},
      event
    }));
    expect(state.prop1).to.equal(44);
    expect(sentEvents.length).to.equal(1);
    expect(sentEvents[0]).to.equal(event);
  });

  it('accepts operation results', () => {
    const event: Event = new Event();
    store.applyResult({
      update: {prop1: 124},
      event
    });
    expect(state.prop1).to.equal(124);
    expect(sentEvents.length).to.equal(1);
    expect(sentEvents[0]).to.equal(event);
  });

  describe('when two successive updaters apply same diff', () => {
    beforeEach(() => {
      store.update(s => ({prop2: 'updated'}));
      store.update(s => ({prop2: 'updated'}));
      store.update(s => ({prop1: 0}));
    });

    it('the following updater receives a state', () => {
      store.update(s => {
        expect(s).to.exist;
        return s;
      });
    });

    it('stores updates from all updaters', () => {
      expect(state.prop2).to.exist;
    });

  });

  it('stores Date', () => {
    const now = new Date();
    store.updateState({dateProp: () => now});
    expect(state.dateProp).to.equal(now);
  });

  describe('when updater returns previous state', () => {
    beforeEach(() => {
      store.update(state => state);
    });

    it('does not create new state transition', () => {
      expect(stateTransitions.length).to.equal(1);
    })
  });

  it('accepts Observable diff', () => {
    const diff$ = new Subject<Object>();
    store.updateStateMany(diff$);
    diff$.next({prop1: 1});
    expect(state.prop1).to.equal(1);
    diff$.next({prop1: 2});
    expect(state.prop1).to.equal(2);
  });

  it('takes only first emitted diff when updating once', () => {
    const diff$ = new Subject<Object>();
    store.updateStateOnce(diff$);
    diff$.next({prop1: 1});
    diff$.next({prop1: 2});
    expect(state.prop1).to.equal(1);
  });

  it('accepts Observable updater', () => {
    const updater$ = new Subject<DiffProvider<State>>();
    store.updateMany(updater$);
    const updater: DiffProvider<State> = state => ({prop1: state.prop1 + 1});
    updater$.next(updater);
    expect(state.prop1).to.equal(43);
    updater$.next(updater);
    expect(state.prop1).to.equal(44);
  });

  it('executes only first updater when updating once', () => {
    const updater$ = new Subject<DiffProvider<State>>();
    store.updateOnce(updater$);
    const updater: DiffProvider<State> = state => ({prop1: state.prop1 + 1});
    updater$.next(updater);
    updater$.next(updater);
    expect(state.prop1).to.equal(43);
  });

});

