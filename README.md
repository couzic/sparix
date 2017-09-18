# DEPRECATED in favor of [lenrix](https://github.com/couzic/lenrix) (which finally solves the single VS multi store problem)

# sparix

#### Type-safe Single Page Application state management powered by RxJS

### Introduction
This project aims to alleviate the pain in SPA development by implementing an opiniated pattern for modeling an application's state in a framework-agnostic, easy-to-test and developer-friendly way.
Sparix allows you to encapsulate state in type-safe Stores, and define the transformations that can occur on said state. An update can never mutate the state, instead it creates a new transformed instance of the state (just like a redux reducer). The transformed states sequence are made publically available as a RxJS `Observable<State>`.

Sparix is written in TypeScript, and so are the code samples. It is distributed as a JavaScript library with type definitions embedded in the NPM module, just like RxJS.

### Quickstart

#### Install
```sh
$ npm i -S sparix rxjs
```

#### Create a Store
```ts
import {Store} from 'sparix'
import {add} from 'ramda'

export interface CounterState {
    count: number
}

const initialState: CounterState = {
    count: 0
}

export class Counter extends Store<CounterState> {
    constructor() {
        super(initialState)
    }
    
    increment() {
        // ALL THESE ARE EQUIVALENT
        this.update(state => {count: state.count + 1})
        this.updateState({count: val => val + 1})
        this.updateState({count: add(1)}) // Using Ramda's automatically curryied functions
    }
}
```

#### Consume the Store's state
```ts
import {Counter, CounterState} from './counter'

const counter = new Counter()

// Recommended way
const state$: Observable<CounterState> = counter.state$
const count$: Observable<number> = counter.map(state => state.count)

// Alternative way (useful for testing)
expect(counter.currentState.count).toEqual(0)
counter.increment()
expect(counter.currentState.count).toEqual(1)
```

### What is sparix ?
First, it's a pattern. Second, it's an implementation based on RxJS. The implementation is quite trivial, and it would only take a couple hours to rewrite it with another reactive library. However, since the SPA world is to be dominated by React and Angular2, and since the latter ships with RxJS, it made sense to use this library for the reference implementation of sparix.

### Immutablility
In sparix, the state is modeled as an `Observable<State>`, an immutable stream of state transitions.

### Testability
A Store's API is kept simple, and all the complex logic is encapsulated and hidden from the outside, just like you would do with good old Object Oriented Programming. To test a Store, all you need to do is simulate an input (by calling one of its public methods) and check its output (the state).

### How it compares to redux
Sparix completely adheres to the redux principle (or rather, the Elm Architecture principle) where state transformations are defined as pure functions which do not mutate the previous state.

In redux, when you need to update the state, you dispatch an action. But if you look closely, you might realize that actions can be sorted in two categories :
* Actions that represent commands. They target a single reducer, to update a single subset of the state tree. Their names are usually in imperative form (*ADD_TODO*, *INCREMENT_COUNTER*...). I'll refer to them as **Updaters**.
* Actions that represent events. They target one or many reducers, to notify the system that something happened. Their names are usually in declarative form (*TODO_SAVED*, *TODO_SAVE_FAILED*...). I refer to them as **Events**.
 
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
const increment = val => val + 1

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
