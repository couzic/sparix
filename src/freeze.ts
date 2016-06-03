export function freeze<T extends Object>(o: T): T {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop)
      && o[prop]
      && (typeof o[prop] === 'object' || typeof o[prop] === 'function')
      && !Object.isFrozen(o[prop])) {
      freeze(o[prop]);
    }
  });

  return o;
}
