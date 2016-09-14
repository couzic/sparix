# sparix

## DISCLAIMER: Serious WIP !!!

#### Single Page Application state management powered by RxJS
###### Inspired by Flux, Redux, Hexagonal Architecture and more..

### Introduction
This project aims to alleviate the pain in SPA development by providing a set of opiniated tools and patterns to model the application core's state, in a simple, easily testable and immutable way. In the sparix world, the state is encapsulated in Stores, which are responsible for updating the state. This state is made publically available as an Observable, or in other words as a succession of state transitions. Several stores can communicate between themselves by dispatching global events.

### Quickstart

#### Install
```sh
$ npm i -S sparix rxjs
```

#### Create a Store
```ts
import {Store, EventQueue} from 'sparix'

export interface CounterState {
    count: number
}

const initialState: CounterState = {
    count: 0
}

export class Counter extends Store<CounterState> {
    constructor(eventQueue: EventQueue) {
        super(eventQueue, initialState)
    }
    
    increment() {
        this.updateState({count: val => val + 1})
    }
}
```

#### Consume the Store's state
```ts
import {Counter} from './counter'

const counter: Counter = ... // Get counter instance from exported module or dependency injection

// Recommended way
const count$: Observable<number> = counter.map(state => state.count)

// Alternative way (useful for testing)
expect(counter.currentState.count).toEqual(0)
counter.increment()
expect(counter.currentState.count).toEqual(1)
```

#### Dispatch an Event
```ts
export class CountIncremented {
    constructor(public newCount: number) {}
}

export class Counter extends Store<CounterState> {
    // constructor
    
    increment() {
        this.updateState({count: val => val + 1})
        this.dispatch(state => new CountIncremented(state.count))
    }
}
```

#### Handle an Event
```ts
import {Store, EventQueue} from 'sparix'
import {CountIncremented} from './counter'

export interface EvenCountState {
    isEven: boolean
}

const initialState: EvenCountState = {
    isEven: true
}

export class EventCountStore extends Store<EvenCountState> {
    constructor(eventQueue: EventQueue) {
        super(eventQueue, initialState)
        this.on(CountIncremented, event => this.updateState({isEven: event.newCount % 2 === 0}) 
    }
}
```

### What is sparix ?
First, it's a pattern (or set of patterns). Second, it's an implementation based on RxJS. The implementation is quite trivial, and it would only take a few hours to migrate it to another reactive library. However, since the SPA world will soon be dominated by two giants, React and Angular2, and since the latter ships with RxJS, it made sense to use this library for the reference implementation of sparix.

### How it compares to redux
In redux, when you need to update the state, you dispatch an action. But if you look closely, you might realize that actions can be sorted in two categories :
* Actions that target a single reducer, to update a single subset of the state tree. Their names are usually in imperative form (*ADD_TODO*, *INCREMENT_COUNTER*...). I call them **Updaters**.
* Actions that target one or many reducers, to notify the system that something happened. Their names are usually in declarative form (*TODO_SAVED*, *TODO_SAVE_FAILED*...). I call them **Events**.
 
My claim is that actions are too heavy a mechanism when the goal is simply to update a single Store's state (as in most cases). In sparix, a Store can directly update its state with no more ceremony than:
```ts
// Increment counter
this.update(state => ({
    counter: state.counter + 1
}))
```
There is a finer-grained, more declarative way to write these state updaters:
```ts
this.updateState({
    counter: prevCounter => prevCounter + 1
})
```
Or even better:
```ts
const increment = value => value + 1

this.updateState({
    counter: increment
})
```
Well, actually you should leverage Ramda's automatic currying:
```ts
import {add} from 'ramda'

this.updateState({
    counter: add(1)
})
```
I like to think of these state updaters as anonymous actions. In redux, it would be like dispatching a reducer. But what about action creators ? Well, we don't need them really: 
```ts
const increment = R.add(1)

class SomeStore extends Store<SomeState> {
    // constructor
    incrementCounter() {
        this.updateState({
            counter: increment
        })
    }
}
```
Here, the `incrementCounter()` method is part of the Store's public API. You no longer need to dispatch a global action created by an action creator. Just call the method !

## Philosophy

### Core
Sparix is all about modeling your application's core. But what is a core ? Or rather, what's NOT in the core ?

The application core should be agnostic. Agnostic to frameworks and databases, agnostic to the presentation layer, agnostic to the data fetching mechanism and protocols. It should be agnostic To **EVERYTHING**.

The application core doesn't know about HTML, the DOM, Angular or React, Local Storage, HTTP or WebSockets.. It doesn't even know that it lives in a web browser ! The same application core should be reusable in Cordova, NativeScript or Electron apps **without changing a single line of code** ! 

So what do you put in the core ? The answer is quite simple: **everything else** ! If it can be part of the core, it should be part of the core. All the business logic, the data transformations, the interaction logic, should be modeled as the application core. And **none of that** should depend on anything else than the programming language which was used to model it.

So back to sparix. It will help you model an application core that does not depend on third-party libraries and frameworks, with two exceptions being RxJS and sparix itself. But that's not much of a problem. Observables are on their way of becoming a standard ECMAScript feature, and sparix is a non-intrusive library, which makes it easy to model only a subset of your application core with it.

### Immutablility
In sparix, the state is modeled as an `Observable<State>`, an immutable stream of immutable states. There can be no side effects. It's as simple as that.

### Testability
Sparix introduces the concept of Diamond Architecture. Stores have two kinds of inputs:
* Public methods
* Events

And two kinds of outputs:
* The stream of states
* Events

A Store's API is kept simple, and all the complex logic is encapsulated and hidden from the outside, just like you would do with good old Object Oriented  Programming. To test a Store, all you need to do is simulate an input (either by calling its public methods or dispatching an event), and check the output (state or events).

## Concepts

### Store

Each Store represents a cohesive functional subset of your application's core.

Behavior = Core

Stateful core = Store

### Event
Event though most of the time you just want to update the state of a single Store, sometimes you want to dispatch an app-wide event that **any** store could decide it is interested in. Or sometimes you know that only a single store will ever listen to a specific event, but you might still decide to use events just to decouple Stores from each other (and I suggest you do !).

An event is dispatched to all registered Stores before the next event in the queue gets dispatched.
