import SCRYFALL_API, { ScryfallCard } from ".";

/**
 * Infers the card from the given URL
 *
 * Current supported patterns include:
 *
 * - `https://scryfall.com/card/mh2/275/es/*`
 *      - This URL would come from dragging a card from the search results list
 *
 * - `https://cards.scryfall.io/large/front/9/3/931e856e-d1f0-4c26-94b5-849e74a0deab.jpg?1646264217`
 *      - This URL would come from dragging a card inside it's details view
 *
 * DISCLAIMER:
 *
 * There is none, scryfall api = good :-)
 *
 * @param url The url to infer card from
 * @returns A Promise of a ScryfallCard or null
 */
export async function inferCardFromUrl(url: URL): Promise<ScryfallCard | null> {
    return null;
}
