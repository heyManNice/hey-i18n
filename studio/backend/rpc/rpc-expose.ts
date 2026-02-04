import * as explorer from '../interface/explorer';
import * as editor from '../interface/editor';

const backend = {
    explorer,
    editor
};

type Asyncify<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K] extends object
    ? Asyncify<T[K]>
    : T[K];
};


export default backend;

export type BackendType = Asyncify<typeof backend>;