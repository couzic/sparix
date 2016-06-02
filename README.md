# sparix

##### Single Page Application state management powered by RxJS
###### Inspired by Flux, Redux, Hexagonal Architecture and more..

### Introduction
This project aims to alleviate the pain in SPA development by providing a set of opiniated tools and patterns to model the application core's state. In the sparix world, the state is encapsulated in Stores, which are responsible for updating the state. This state is made publically available as an Observable, or in other words as a succession of state transitions (which might remind you of redux). Several stores can communicate between themselves by dispatching global events.

### What is sparix ?
First, it's a pattern (or set of patterns). Second, it's an implementation based on RxJS. The implementation is quite trivial, and it would only take a few hours to migrate it to another reactive library. However, since the SPA world will soon be dominated by two giants, React and Angular2, and since the latter ships with RxJS, it made sense to use this library for the reference implementation of sparix.

### How it compares to redux
In redux, when you need to update the state, you dispatch an action. But if you look closely, you might realize that actions can be sorted in two categories :
* Actions that target a single reducer, to update a single subset of the state tree. Their names are usually in imperative form (*ADD_TODO*, *INCREMENT_COUNTER*...). I call them **Updaters**.
* Actions that target one or many reducers, to notify the system that something happened. Their names are usually in declarative form (*TODO_SAVED*, *TODO_SAVE_FAILED*...). I call them **Events**.
 
My claim is that actions are too heavy a mechanism when the goal is simply to apply an update on a single Store (as in most cases). In sparix, a Store can directly update its state with no more ceremony than:
```typescript
class SomeStore extends Store<SomeState> {
    // constructor
    incrementCounter() {
        this.update(state => ({
            counter: state.counter + 1
        }));
    }
}
```
I like to think of it as an anonymous action. The `incrementCounter()` method, our "*anonymous action creator*", becomes part of the Store's public API. You no longer need to dispatch a global action, just call the method !

### Goals
* Simplicity
* Simplicity
* Immutability
* Testability
* Simplicity

## Philosophy

### Core
Sparix is all about modeling your application's core. But what is a core ? Or rather, what's NOT in the core ?

The application core should be agnostic. Agnostic to frameworks and databases, agnostic to the presentation layer, agnostic to the data fetching mechanism and protocols. It should be agnostic To **EVERYTHING**.

The application core doesn't know about HTML, the DOM, Angular or React, Local Storage, HTTP or WebSockets.. It doesn't even know that it lives in a web browser ! The same application core should be reusable in Cordova, NativeScript or Electron apps **without changing a single line of code** ! 

So what do you put in the core ? The answer is quite simple: **everything else** ! If it can be part of the core, it should be part of the core. All the business logic, the data transformations, the interaction logic, should be modeled as the application core. And **none of that** should depend on anything else than the programming language which was used to model it.

So back to sparix. It will help you model an application core that does not depend on third-party libraries and frameworks, with two exceptions being RxJS and sparix itself. But that's not much of a problem. Observables are on their way of becoming a standard ECMAScript feature, and sparix is a non-intrusive library, which makes it easy to model only a subset of your application core with it.

### Immutablility

### Testability

## Concepts


### Store

Each Store represents a cohesive functional subset of your application's core.

State + Behavior = Store

### Event
Event though most of the time you just want to update the state of a single Store, sometimes you want to dispatch an app-wide event that **any** store could decide it is interested in. Or sometimes you know that only a single store will ever listen to a specific event, but you might still decide to use events just to decouple Stores from each other (and I suggest you do !).

An event is dispatched to all registered Stores before the next event in the queue gets dispatched.


### Getting Started
```sh
$ npm i -S sparix
```

#### Create a Store
```ts
import {Store, EventQueue} from 'sparix'

interface HeroState {
    power: number,
    level: number
}

const initialState: HeroState = {
    power: 1,
    level: 1
}

const eventQueue = new EventQueue();

class Hero extends Store<HeroState> {
    constructor() {
        super(eventQueue, initialState)
    }
    
    gainLevel() {
        this.update(state => ({level: state.level + 1}))
    }
}
```

#### Using a Store's state
```ts
import {Hero, HeroState} from './hero'

const hero: Hero = new Hero()
const state$: Observable<HeroState> = hero.state$
const heroLevel$: Observable<number> = hero.state$.map(state => state.level)

const initialLevel: number = hero.currentState.level
hero.gainLevel()
const updatedLevel: number = hero.currentState.level
console.log(initialLevel) // "1"
console.log(updatedLevel) // "2"
```
