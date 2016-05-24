# sparix

##### Single Page Application state management powered with RxJS

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