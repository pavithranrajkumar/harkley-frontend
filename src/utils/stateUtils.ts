/**
 * Generic state update utilities to eliminate DRY violations
 */

/**
 * Creates a new Map with the specified key removed
 */
export const removeFromMap = <K, V>(map: Map<K, V>, key: K): Map<K, V> => {
  const newMap = new Map(map);
  newMap.delete(key);
  return newMap;
};

/**
 * Creates a new Set with the specified item removed
 */
export const removeFromSet = <T>(set: Set<T>, item: T): Set<T> => {
  const newSet = new Set(set);
  newSet.delete(item);
  return newSet;
};
