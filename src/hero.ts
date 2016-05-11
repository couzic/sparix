import {Store} from './store';
import {EventBus, CoreEvent} from './event-bus';
import {MonsterDied} from './monster';

export class HeroState {

  public level: number;
  public attackCount: number;
  public power: number;

}

export class HeroAttacked implements CoreEvent {
  constructor(public damage: number) {
  }
}

export class HeroGainedLevel implements CoreEvent {
  constructor(public newLevel: number) {
  }
}

const initialState: HeroState = {
  level: 1,
  attackCount: 0,
  power: 1
};

const incrementAttackCount = state => ({attackCount: state.attackCount + 1});

export class Hero extends Store<HeroState> {

  constructor(eventBus: EventBus) {
    super(eventBus, initialState);
    this.on(MonsterDied, (state: HeroState, event: MonsterDied) => ({
      update: {level: state.level + 1},
      event: new HeroGainedLevel(state.level + 1)
    }));
  }

  attack() {
    this.update(incrementAttackCount);
    this.dispatch(state => new HeroAttacked(state.power));
  }

}
