import SCRYFALL_API, { ScryfallCard } from ".";

const MATCHES = ["card", "large"];

async function getCardByCode(split: string[]): Promise<ScryfallCard | null> {
    if (split.length < 4) {
        console.error(`Split length was less than 3 was ${split.length}`);
        return null;
    }

    const code = split[1];
    const number = split[2];
    const lang = split.length === 5 ? split[3] : undefined;

    return SCRYFALL_API.getScryfallCard(code, number, lang);
}

async function getCardByUuid(split: string[]): Promise<ScryfallCard | null> {
    return null;
}

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
    if (!url || !url.pathname || url.pathname === "") {
        console.error(`Url was null`);
        return null;
    }

    const trimmed = url.pathname.replaceAll("/", " ").trim();
    const split = trimmed.split(" ");

    if (split.length < 1 || !MATCHES.includes(split[0])) {
        console.error(`First part of Url path not supported was ${split[0]}`);
        return null;
    }

    switch (split[0]) {
        case "card":
            return getCardByCode(split);
        case "large":
            return getCardByUuid(split);
        default:
            console.error(`Url was not of options card or large!`);
            return null;
    }
}
