import { ScryfallCard, ScryfallError } from "../scryfall/types";

export type MoxfieldCard = {
    id: string;
    uniqueCardId: string;
};

export type MainboardPayload = {
    cardId: string;
    quantity: number;
    userPrefPrinting: boolean;
};

export type Mainboardresponse = {
    card: CardInBoardMetadata;
    collection: any[];
    tags: any[];
    tokens: any[];
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
export type DeckResponse = {
    id: string;
    publicUrl: string;
    publicId: string;
    version: number;
    visibility: boolean;
};

export type GetCardResponse = {
    card: MoxfieldCard & ScryfallCard;
    editions: any[];
};

export type GetMultipleCardResponse = {
    hasMore: boolean;
    totalCards: number;
    data: (MoxfieldCard & ScryfallCard)[];
    exactMatch: MoxfieldCard & ScryfallCard;
} & ScryfallError;

export type CardInBoardMetadata = {
    card: MoxfieldCard & ScryfallCard;
    boardType: string;
    excludedFromColor: boolean;
    finish: string;
    isAlter: boolean;
    isFoil: boolean;
    isProxy: boolean;
    quantity: number;
    useCmcOverride: boolean;
    useColorIdentityOverride: boolean;
    useManaCostOverride: boolean;
};
