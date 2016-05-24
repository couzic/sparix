# sparix

##### Single Page Application state management powered by RxJS

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
