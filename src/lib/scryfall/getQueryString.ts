import { ScryfallCard } from "./types";

/**
 * Constructs a query string suitable for getting an exact
 * match from the Moxfield API
 * @param card The card to create query string from
 * @returns The query string
 */
export function getQueryString(card: ScryfallCard): string {
    return encodeURI(`!"${card.name}" b:${card.set} cn:${card.collector_number}`);
}
