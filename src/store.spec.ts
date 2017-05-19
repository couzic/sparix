import {expect} from 'chai'
import {DiffProvider, Operation, OperationResult, PartialDiff, Store} from './store'
import {CoreEvent, EventQueue} from './event-queue'
import {update, updaterFor, updateType} from './update'

class State {
   prop1: string
   prop2: string
   dateProp: Date
   deepObject: {
      subProp1: number
      subProp2: string
   }
   arrayProp: string[]
}

const initialProp1Value = 'initialProp1Value'
const updatedProp1Value = 'updatedProp1Value'

const initialProp2Value = 'initialProp2Value'
const updatedProp2Value = 'updatedProp2Value'

const initialState: State = {
   prop1: initialProp1Value,
   prop2: initialProp2Value,
   dateProp: new Date(),
   deepObject: {
      subProp1: 42,
      subProp2: initialProp2Value
   },
   arrayProp: ['1', '2', '3']
}

class Event implements CoreEvent {
}

class TestStore extends Store<State> {
   constructor(eventQueue?: EventQueue) {
      super(initialState, eventQueue)
   }

   updateState(diff: PartialDiff<State>) {
      super.updateState(diff)
   }

   update(updater: DiffProvider<State>) {
      super.update(updater)
   }

   execute(operation: Operation<State>) {
      super.execute(operation)
   }

   dispatch(eventProvider: (the: State) => CoreEvent) {
      super.dispatch(eventProvider)
   }

   applyResult(operationResult: OperationResult<State>) {
      super.applyResult(operationResult)
   }

   resetState() {
      super.resetState()
   }
}

describe('Store with no eventQueue', () => {
   it('can be instantiated', () => {
      new TestStore()
   })
})

describe('Store', () => {

   let store: TestStore
   let state: State
   let stateTransitions: State[]
   let eventQueue: EventQueue
   let sentEvents: CoreEvent[]

   beforeEach(() => {
      eventQueue = new EventQueue()
      store = new TestStore(eventQueue)
      stateTransitions = []
      store.state$.subscribe(newState => {
         state = newState
         stateTransitions.push(newState)
      })
      sentEvents = []
      eventQueue.event$.subscribe(event => sentEvents.push(event))
   })

   describe('initial state', () => {

      it('is immutable', () => {
         expect(() => state.prop1 = 'mutation').to.throw()
      })

   })

   describe('updated state', () => {
      beforeEach(() => store.updateState({prop1: updatedProp1Value}))

      it('is immutable', () => {
         expect(() => state.prop1 = 'mutation').to.throw()
      })

      it('can be reset', () => {
         store.resetState()
         expect(state.prop1).to.equal(initialProp1Value)
      })

   })

   describe('.map()', () => {
      let prop1History: string[]
      let deepObjectHistory: Array<{
         subProp1: number
         subProp2: string
      }>
      beforeEach(() => {
         prop1History = []
         deepObjectHistory = []
         store
            .map(s => s.prop1)
            .subscribe(prop1 => prop1History.push(prop1))
         store
            .map(s => s.deepObject)
            .subscribe(deepObj => deepObjectHistory.push(deepObj))
      })

      it('does not send subsequent change notifications with same value', () => {
         store.updateState({})
         expect(prop1History.length).to.equal(1)
      })

      it('does not send subsequent change notifications with same object', () => {
         store.updateState({prop1: updatedProp1Value})
         expect(deepObjectHistory.length).to.equal(1)
      })
   })

   it('accepts updaters', () => {
      store.update(s => ({prop1: updatedProp1Value}))
      expect(state.prop1).to.equal(updatedProp1Value)
   })

   it('accepts deep updates', () => {
      store.updateState({
         deepObject: {
            subProp1: 422,
            subProp2: () => ''
         }
      })
      expect(state.deepObject.subProp1).to.equal(422)
      expect(state.deepObject.subProp2).to.equal('')
   })

   it('accepts deep partial updates', () => {
      store.updateState({
         deepObject: val => update(val, {
            subProp1: 477
         })
      })
      expect(state.deepObject.subProp1).to.equal(477)
   })

   it('accepts deep granular updates', () => {
      store.updateState({
         deepObject: val => update(val, {
            subProp2: (val: string) => ''
         })
      })
      expect(state.deepObject.subProp2).to.equal('')
   })

   it('accepts deep declarative granular updates', () => {
      store.updateState({
         deepObject: updateType<{
            subProp1: number
            subProp2: string
         }>({
            subProp2: ''
         })
      })
      expect(state.deepObject.subProp2).to.equal('')
   })

   it('accepts deep granular updaters', () => {
      store.updateState({
         deepObject: updateType<{
            subProp1: number
            subProp2: string
         }>({
            subProp2: () => ''
         })
      })
      expect(state.deepObject.subProp2).to.equal('')
   })

   it('accepts deep granular generic updaters', () => {
      const updateDeepObject = updaterFor<{
         subProp1: number
         subProp2: string
      }>()
      store.updateState({
         deepObject: updateDeepObject({
            subProp2: () => ''
         })
      })
      expect(state.deepObject.subProp2).to.equal('')
   })

   it('accepts event providers', () => {
      const event: Event = new Event()
      store.dispatch(s => event)
      expect(sentEvents.length).to.equal(1)
      expect(sentEvents[0]).to.equal(event)
   })

   it('accepts operations', () => {
      const event: Event = new Event()
      store.execute(s => ({
         update: {prop1: updatedProp1Value},
         event
      }))
      expect(state.prop1).to.equal(updatedProp1Value)
      expect(sentEvents.length).to.equal(1)
      expect(sentEvents[0]).to.equal(event)
   })

   it('accepts operation results', () => {
      const event: Event = new Event()
      store.applyResult({
         update: {prop1: updatedProp1Value},
         event
      })
      expect(state.prop1).to.equal(updatedProp1Value)
      expect(sentEvents.length).to.equal(1)
      expect(sentEvents[0]).to.equal(event)
   })

   describe('when two successive updaters apply same diff', () => {
      beforeEach(() => {
         store.update(s => ({prop2: 'updated'}))
         store.update(s => ({prop2: 'updated'}))
         store.update(s => ({prop1: updatedProp1Value}))
      })

      it('the following updater receives a state', () => {
         store.update(s => {
            expect(s).to.exist
            return s
         })
      })

      it('stores updates from all updaters', () => {
         expect(state.prop2).to.exist
      })

   })

   it('stores Date', () => {
      const now = new Date()
      store.updateState({dateProp: () => now})
      expect(state.dateProp).to.equal(now)
   })

   describe('when updater returns previous state', () => {
      beforeEach(() => {
         store.update(state => state)
      })

      it('does not create new state transition', () => {
         expect(stateTransitions.length).to.equal(1)
      })
   })

   it('picks multiple keys', () => {
      const pick$ = store.pick('prop1', 'prop2')
      let pick = null
      pick$.subscribe(p => pick = p)

      expect(pick).to.deep.equal({
         prop1: initialProp1Value,
         prop2: initialProp2Value
      })
   })

   it('notifies once only when state is updated twice but pick stays the same', () => {
      let notifications = 0
      store.pick('prop1', 'prop2').subscribe(() => ++notifications)

      store.updateState({arrayProp: []})

      expect(notifications).to.equal(1)
   })

})

