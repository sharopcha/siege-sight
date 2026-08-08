export function assertNever(value: never, context: string): never {
    throw new Error(`Unhandled variant in ${context}: ${JSON.stringify(value)}`);
}
