import {Hero, HeroState, HeroAttacked, HeroGainedLevel} from './hero';
import {EventBus, CoreEvent} from './event-bus';
import {MonsterDied} from './monster';

describe('Hero', () => {

  let hero: Hero;
  let state: HeroState;
  let eventBus: EventBus;
  let sentEvents: CoreEvent[];

  beforeEach(() => {
    eventBus = new EventBus();
    hero = new Hero(eventBus);
    hero.state$.subscribe(newState => state = newState);
    sentEvents = [];
    eventBus.event$.subscribe(event => sentEvents.push(event));
  });

  describe('initial state', () => {

    it('has level 1', () => {
      expect(state.level).toEqual(1);
    });

    it('has an attack count of zero', () => {
      expect(state.attackCount).toEqual(0);
    });

  });

  describe('when attacked once', () => {
    beforeEach(() => hero.attack());

    it('has an attack count of 1', () => {
      expect(state.attackCount).toEqual(1);
    });

    it('sends HeroAttacked event', () => {
      expect(sentEvents.length).toBe(1);
      expect(sentEvents[0].constructor).toBe(HeroAttacked);
      expect((<HeroAttacked>sentEvents[0]).damage).toEqual(1);
    });

  });

  describe('when receives MonsterDied event', () => {
    beforeEach(() => eventBus.dispatch(new MonsterDied()));

    it('gains a level', () => {
      expect(state.level).toEqual(2);
    });

    it('sends a HeroGainedLevel event', () => {
      expect(sentEvents.length).toEqual(2);
      expect(sentEvents[0].constructor).toBe(MonsterDied);
      expect(sentEvents[1].constructor).toBe(HeroGainedLevel);
      expect((<HeroGainedLevel>sentEvents[1]).newLevel).toEqual(2);
    });
  });

});
