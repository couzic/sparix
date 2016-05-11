declare module "lodash.isequal" {

  interface IsEqual {
    (a: any, b: any): boolean;
  }

  var isEqual: IsEqual;

  export = isEqual;

}
