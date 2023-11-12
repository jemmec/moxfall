import {
    DeckResponse,
    GetCardResponse,
    GetMultipleCardResponse,
    MainboardPayload,
    Mainboardresponse,
    RefreshResponse
} from "./types";

const MOXFIELD_API = "https://api2.moxfield.com";

/**
 * MOXFIELD API
 */

const mainboard = async (
    payload: MainboardPayload,
    privateDeckId: string,
    accessToken: string
): Promise<Mainboardresponse> => {
    const res = await fetch(`${MOXFIELD_API}/v2/decks/${privateDeckId}/cards/mainboard`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${accessToken}`
        }
    }).then((res) => res.json() as unknown as Mainboardresponse);
    return res;
};

const refresh = async (): Promise<RefreshResponse> => {
    const res = await fetch(`${MOXFIELD_API}/v1/account/token/refresh`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
            ignoreCookie: false
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((res) => res.json() as unknown as RefreshResponse);
    return res;
};

const deck = async (publicDeckId: string, accessToken: string): Promise<DeckResponse> => {
    const res = await fetch(`${MOXFIELD_API}/v3/decks/all/${publicDeckId}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Authorization: `bearer ${accessToken}`
        }
    }).then((res) => res.json() as unknown as DeckResponse);
    return res;
};

const getMoxfieldCard = async (cardId: string, accessToken: string): Promise<GetCardResponse> => {
    return await fetch(`${MOXFIELD_API}/v2/cards/details/${cardId}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Authorization: `bearer ${accessToken}`
        }
    }).then(async (res) => {
        const j = await res.json();
        // console.log("The card we fetched was", j);
        return j as unknown as GetCardResponse;
    });
};

const getMoxfieldCardsSearch = async (
    q: string,
    accessToken: string
): Promise<GetMultipleCardResponse> => {
    return await fetch(`${MOXFIELD_API}/v2/cards/search/user?q=${q}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Authorization: `bearer ${accessToken}`
        }
    }).then((res) => res.json() as unknown as GetMultipleCardResponse);
};

export default {
    refresh,
    deck,
    mainboard,
    getMoxfieldCard,
    getMoxfieldCardsSearch
};
