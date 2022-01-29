export declare function useLocalStorage<Type extends string | number | boolean | object>(initialValue: Type, storageKey: string): [Type, (newValue: Type) => void];
