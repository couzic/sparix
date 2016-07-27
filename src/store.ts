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
  (state: State): Object;
}

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

export class Store<State extends Object> extends Core {

  private update$ = new Subject<Updater<State>>();
  private stateSubject$: BehaviorSubject<State>;

  constructor(eventQueue: EventQueue, private initialState: State) {
    super(eventQueue);

    function stateReducer(previousState: State, operation: Updater<State>) {
      const diff = operation(previousState);
      if (diff === previousState) return previousState;
      else return immupdate(previousState, diff);
    }

    this.stateSubject$ = new BehaviorSubject<State>(freeze(initialState));
    this.update$
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
    this.update$.next(updater);
  }

  protected updateState(diff: Object) {
    this.update$.next(state => diff);
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

}
