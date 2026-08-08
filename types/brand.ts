declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type MatchId = Brand<string, 'MatchId'>;
export type RoundId = Brand<string, 'RoundId'>;
export type PlayerId = Brand<string, 'PlayerId'>;
export type Tick = Brand<number, 'Tick'>;
