import project from '../manager/project.js';

const backend = {
    manager: {
        project
    }
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