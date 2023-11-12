import { ScryfallCard } from "./types";

const SCRYFALL_API = "https://api.scryfall.com";

/**
 * SCRYFALL API
 */

const getScryfallCard = async (
    code: string,
    number: number,
    lang?: string | undefined
): Promise<ScryfallCard> => {
    return await fetch(`${SCRYFALL_API}/cards/${code}/${number}${lang ? `/${lang}` : ""}`).then(
        (res) => res.json() as unknown as ScryfallCard
    );
};

export default {
    getScryfallCard
};
