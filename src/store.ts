import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import immupdate from 'immupdate';
import {CoreEvent, EventQueue} from './event-queue';
import {freeze} from './freeze';

export interface Mapper<State, R> {
  (state: State): R;
}

export interface Diff {
}

export interface Updater<State> {
  (state: State): Diff;
}

export interface EventProvider<State> {
  (state: State): CoreEvent;
}

export class OperationResult<State> {
  public update: Diff;
  public event: CoreEvent;
}

export interface Operation<State> {
  (state: State): OperationResult<State>;
}

export interface CoreEventHandler<Event extends CoreEvent> {
  (event: Event): void;
}

export class Store<State> {

  private update$ = new Subject<Updater<State>>();
  private stateSubject$: BehaviorSubject<State>;
  private eventHandlers = {};

  constructor(private eventBus: EventQueue, private initialState: State) {
    eventBus.event$
      .subscribe(event => this.handleEvent(event));

    function stateReducer(previousState: State, operation: Updater<State>) {
      const diff = operation(previousState);
      return immupdate(previousState, diff);
    }

    this.stateSubject$ = new BehaviorSubject(freeze(initialState));
    this.update$
      .scan(stateReducer, initialState)
      .map(freeze)
      .subscribe(this.stateSubject$);
  }

  get state$(): Observable<State> {
    return this.stateSubject$;
  }

  get currentState(): State {
    return this.stateSubject$.getValue();
  }

  map<R>(project: Mapper<State, R>): Observable<R> {
    return this.state$.map(project).distinctUntilChanged();
  }

  protected on<Event extends CoreEvent>(eventType: Function, handler: CoreEventHandler<Event>) {
    this.eventHandlers[eventType.name] = handler;
  }

  protected update(updater: Updater<State>) {
    this.update$.next(updater);
  }

  protected updateState(diff: Diff) {
    this.update$.next(state => diff);
  }

  protected dispatchEvent(event: CoreEvent) {
    this.eventBus.dispatch(event);
  }

  protected dispatch(eventProvider: EventProvider<State>) {
    this.eventBus.dispatch(eventProvider(this.stateSubject$.getValue()));
  }

  protected execute(operation: Operation<State>) {
    const result = operation(this.stateSubject$.getValue());
    this.updateState(result.update);
    this.dispatchEvent(result.event);
  }

  protected applyResult(operationResult: OperationResult<State>) {
    this.updateState(operationResult.update);
    this.dispatchEvent(operationResult.event);
  }

  private handleEvent<Event extends CoreEvent>(event: Event): void {
    const handler: CoreEventHandler<Event> = this.eventHandlers[event.constructor.name];
    if (handler) {
      handler(event);
    }
  }
}
