import {PartialDiff} from './store';
import immupdate from 'immupdate';

const checkDiffIsObject = <T>(diff: PartialDiff<T>) => {
   if (typeof diff === 'function')
      throw Error('sparix: update() and updateWith() do not accept functions as parameters')
}

export const updateValue = <T extends object>(currentValue: T, diff: PartialDiff<T>): T => {
   checkDiffIsObject(diff)
   return immupdate(currentValue, diff)
}

export const update = <T extends object>(currentValue: T) => ({
   with: (diff: PartialDiff<T>): T => updateValue(currentValue, diff)
})

// export const updateWith = <T extends object>(diff: PartialDiff<T>) =>
//    (currentValue: T): T => update(currentValue).with(diff)

export const updateType = <T extends object>() => ({
   with: (diff: PartialDiff<T>) =>
      (currentValue: T): T => updateValue(currentValue, diff)
})
