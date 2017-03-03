import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/mergeAll';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CoreEvent, EventQueue} from './event-queue';
import {freeze} from './freeze';
import {Core} from './core';
import {updateValue} from './update';

export interface Mapper<State, R> {
   (state: State): R
}

export interface DiffProvider<State> {
   (state: State): PartialDiff<State>
}

export type FutureUpdater<State> = Observable<DiffProvider<State>>

export interface EventProvider<State> {
   (state: State): CoreEvent
}

export class OperationResult<State> {
   public update: PartialDiff<State>
   public event: CoreEvent
}

export interface Operation<State> {
   (state: State): OperationResult<State>
}

export interface ValueUpdater<V> {
   (val: V): V
}

export type Diff<T> = {
   [P in keyof T]: T[P] | ValueUpdater<T[P]>
   }

export type PartialDiff<T> = {
   [P in keyof T]?: T[P] | ValueUpdater<T[P]> | Diff<T[P]>
   }

export class Store<State extends Object> extends Core {

   private update$ = new Subject<FutureUpdater<State>>()
   private stateSubject$: BehaviorSubject<State>

   constructor(private initialState: State, eventQueue?: EventQueue) {
      super(eventQueue)

      const stateReducer = (previousState: State, operation: DiffProvider<State>) => {
         const diff = operation(previousState)
         if (diff === previousState) return previousState
         else return updateValue(previousState, diff)
      }

      this.stateSubject$ = new BehaviorSubject<State>(freeze(initialState))

      this.update$
         .mergeAll()
         .scan(stateReducer, initialState)
         .map(freeze)
         .subscribe(this.stateSubject$)
   }

   get state$(): Observable<State> {
      return this.stateSubject$.distinctUntilChanged()
   }

   get currentState(): State {
      return this.stateSubject$.getValue()
   }

   map<R>(project: Mapper<State, R>): Observable<R> {
      return this.state$.map(project).distinctUntilChanged()
   }

   select<K extends keyof State>(key: K): Observable<State[K]> {
      return this.map(state => state[key])
   }

   filter(predicate: Mapper<State, boolean>): Observable<State> {
      return this.state$.filter(predicate).distinctUntilChanged()
   }

   protected update(updater: DiffProvider<State>) {
      this.update$.next(Observable.of(updater))
   }

   protected updateState(diff: PartialDiff<State>) {
      this.update(state => diff)
   }

   protected dispatch(eventProvider: EventProvider<State>) {
      this.dispatchEvent(eventProvider(this.stateSubject$.getValue()))
   }

   protected execute(operation: Operation<State>) {
      const result = operation(this.stateSubject$.getValue())
      this.updateState(result.update)
      this.dispatchEvent(result.event)
   }

   protected applyResult(operationResult: OperationResult<State>) {
      this.updateState(operationResult.update)
      this.dispatchEvent(operationResult.event)
   }

   protected updateStateMany(diff$: Observable<PartialDiff<State>>) {
      const updater: FutureUpdater<State> = diff$.map(diff => (state: State) => diff)
      this.update$.next(updater)
   }

   protected updateStateOnce(diff$: Observable<PartialDiff<State>>) {
      this.updateStateMany(diff$.take(1))
   }

   protected updateMany(updater$: FutureUpdater<State>) {
      this.update$.next(updater$)
   }

   protected updateOnce(updater$: FutureUpdater<State>) {
      this.updateMany(updater$.take(1))
   }

}
