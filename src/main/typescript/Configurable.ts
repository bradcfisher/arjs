
export interface Configurable<T> {
    configure(config: T): void;
    readonly config: T;
}
