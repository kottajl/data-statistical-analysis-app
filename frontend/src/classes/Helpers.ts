export const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx));
  const targetIdx = Math.min(...idxs) < to ? to += 1 : to -= idxs.filter(idx => idx < to).length;
  const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx));
  const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx));
  return [...leftSide, ...movedElements, ...rightSide];
}
  
export function getIndicesMatchingCondition<T>(array: T[], condition: (element: T) => boolean): number[] {
  var array2: number[] = [];
  array.forEach((value, index) => {
    if (condition(value))
      array2.push(index);
  });
  return array2;
}

export{}