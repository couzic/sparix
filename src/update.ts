import {PartialDiff} from './store';
import immupdate from 'immupdate';

const checkDiffIsObject = <T>(diff: PartialDiff<T>) => {
   if (typeof diff === 'function')
      throw Error('sparix: update() and updateWith() do not accept functions as parameters')
}

export const update = <T extends object>(currentValue: T, diff: PartialDiff<T>) => {
   checkDiffIsObject(diff)
   return immupdate(currentValue, diff)
}

export const updateType = <T extends object>(diff: PartialDiff<T>) =>
   (currentValue: T) => update(currentValue, diff)

export const updaterFor = <T extends object>() =>
   (diff: PartialDiff<T>) =>
      (currentValue: T) => update(currentValue, diff)
