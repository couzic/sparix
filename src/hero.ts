import {Store} from './store';
import {EventQueue, CoreEvent} from './event-queue';
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

  constructor(eventBus: EventQueue) {
    super(eventBus, initialState);
    this.on(MonsterDied, () => {
      this.update(s => ({level: s.level + 1}));
      this.dispatch(s => new HeroGainedLevel(s.level));
    });
  }

  attack() {
    this.update(incrementAttackCount);
    this.dispatch(state => new HeroAttacked(state.power));
  }

}
