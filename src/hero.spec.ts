import {expect} from 'chai'
import {Hero, HeroState, HeroAttacked, HeroGainedLevel} from './hero'
import {EventQueue, CoreEvent} from './event-queue'
import {MonsterDied} from './monster'

describe('Hero', () => {

   let hero: Hero
   let state: HeroState
   let eventQueue: EventQueue
   let sentEvents: CoreEvent[]

   beforeEach(() => {
      eventQueue = new EventQueue()
      hero = new Hero(eventQueue)
      hero.state$.subscribe(newState => state = newState)
      sentEvents = []
      eventQueue.event$.subscribe(event => sentEvents.push(event))
   })

   describe('initial state', () => {

      it('has level 1', () => {
         expect(state.level).to.equal(1)
      })

      it('has an attack count of zero', () => {
         expect(state.attackCount).to.equal(0)
      })

   })

   describe('when attacked once', () => {
      beforeEach(() => hero.attack())

      it('has an attack count of 1', () => {
         expect(state.attackCount).to.equal(1)
      })

      it('sends HeroAttacked event', () => {
         expect(sentEvents.length).to.equal(1)
         expect(sentEvents[0].constructor).to.equal(HeroAttacked)
         expect((<HeroAttacked>sentEvents[0]).damage).to.equal(1)
      })

   })

   describe('when receives MonsterDied event', () => {
      beforeEach(() => eventQueue.dispatch(new MonsterDied()))

      it('gains a level', () => {
         expect(state.level).to.equal(2)
      })

      it('sends a HeroGainedLevel event', () => {
         expect(sentEvents.length).to.equal(2)
         expect(sentEvents[0].constructor).to.equal(MonsterDied)
         expect(sentEvents[1].constructor).to.equal(HeroGainedLevel)
         expect((<HeroGainedLevel>sentEvents[1]).newLevel).to.equal(2)
      })
   })

})
