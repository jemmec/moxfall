import { ScryfallCard, ScryfallResponse } from "./types";

const SCRYFALL_API = "https://api.scryfall.com";

/**
 * SCRYFALL API
 */

const getScryfallCard = async (
    code: string,
    number: number | string,
    lang?: string | undefined
): Promise<ScryfallResponse> => {
    return await fetch(`${SCRYFALL_API}/cards/${code}/${number}${lang ? `/${lang}` : ""}`).then(
        (res) => res.json() as unknown as ScryfallResponse
    );
};

export default {
    getScryfallCard
};
