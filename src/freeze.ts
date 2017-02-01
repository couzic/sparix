export function freeze(o: any) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach((prop: string) => {
    if (o.hasOwnProperty(prop)
      && o[prop]
      && (typeof o[prop] === 'object' || typeof o[prop] === 'function')
      && !Object.isFrozen(o[prop])) {
      freeze(o[prop]);
    }
  });

  return o;
}
