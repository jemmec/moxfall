import { MoxfieldCard } from "./types";

const SCRYFALL_API = "https://api.scryfall.com";
const MOXFIELD_API = "https://api2.moxfield.com";

const addCard = async (source: URL, auth: RefreshResponse): Promise<boolean> => {
    return true;
};

const scryfallId = (cardName: string): string => {
    return "";
};

export type MainboardPayload = {
    cardId: string;
    quantity: number;
    userPrefPrinting: boolean;
};

export type CardResponse = {
    card: MoxfieldCard;
    collection: any[];
    tags: any[];
    tokens: any[];
};

const mainboard = async (
    payload: MainboardPayload,
    privateDeckId: string,
    accessToken: string
): Promise<CardResponse> => {
    const res = await fetch(`${MOXFIELD_API}/v2/decks/${privateDeckId}/cards/mainboard`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${accessToken}`
        }
    }).then((res) => res.json() as unknown as CardResponse);
    return res;
};

export type RefreshResponse = {
    access_token: string;
    feed_access_token: string;
    nolt_token: string;
    user_id: string;
    user_name: string;
    expiration: string;
    expires_in_minutes: number;
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

export type DeckResponse = {
    id: string;
    publicUrl: string;
    publicId: string;
    version: number;
    visibility: boolean;
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

export default {
    refresh,
    deck,
    mainboard,
    addCard,
    scryfallId
};
