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
import {Core} from './core';

export interface Mapper<State, R> {
  (state: State): R;
}

export interface Updater<State> {
  (state: State): any;
}

export type FutureUpdater<State> = Observable<Updater<State>>

export interface EventProvider<State> {
  (state: State): CoreEvent;
}

export class OperationResult<State> {
  public update: Object;
  public event: CoreEvent;
}

export interface Operation<State> {
  (state: State): OperationResult<State>;
}

interface Differ<V> {
  (val: V): V
}

type Diff<T, K extends keyof T> = {
  [P in K]: T[P] | Differ<T[P]>;
  }


export class Store<State extends Object> extends Core {

  private update$ = new Subject<FutureUpdater<State>>();
  private stateSubject$: BehaviorSubject<State>;

  constructor(private initialState: State, eventQueue?: EventQueue) {
    super(eventQueue);

    const stateReducer = (previousState: State, operation: Updater<State>) => {
      const diff = operation(previousState);
      if (diff === previousState) return previousState;
      else return immupdate(previousState, diff);
    };

    this.stateSubject$ = new BehaviorSubject<State>(freeze(initialState));

    this.update$
      .mergeAll()
      .scan(stateReducer, initialState)
      .map(freeze)
      .subscribe(this.stateSubject$);
  }

  get state$(): Observable<State> {
    return this.stateSubject$.distinctUntilChanged();
  }

  get currentState(): State {
    return this.stateSubject$.getValue();
  }

  map<R>(project: Mapper<State, R>): Observable<R> {
    return this.state$.map(project).distinctUntilChanged();
  }

  filter(predicate: Mapper<State, boolean>): Observable<State> {
    return this.state$.filter(predicate).distinctUntilChanged();
  }

  protected update(updater: Updater<State>) {
    this.update$.next(Observable.of(updater));
  }

  protected updateState<K extends keyof State>(diff: Diff<State, K>) {
    this.update(state => diff);
  }

  protected dispatch(eventProvider: EventProvider<State>) {
    this.dispatchEvent(eventProvider(this.stateSubject$.getValue()));
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

  protected updateStateMany(diff$: Observable<Object>) {
    const updater: FutureUpdater<State> = diff$.map(diff => (state: State) => diff);
    this.update$.next(updater);
  }

  protected updateStateOnce(diff$: Observable<Object>) {
    this.updateStateMany(diff$.take(1));
  }

  protected updateMany(updater$: FutureUpdater<State>) {
    this.update$.next(updater$);
  }

  protected updateOnce(updater$: FutureUpdater<State>) {
    this.updateMany(updater$.take(1));
  }

}
