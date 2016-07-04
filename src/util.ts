export const remove = item => array => {
  const copy = [...array];
  copy.splice(copy.indexOf(item), 1);
  return copy;
};
