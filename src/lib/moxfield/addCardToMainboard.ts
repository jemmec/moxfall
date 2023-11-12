import MOXFIELD_API, { DeckResponse, MoxfieldCard } from ".";
import { reduxDispatch } from "../../contentScript";
import { ScryfallCard } from "../scryfall";

export type AddCardToBoardSuccess = {
    ok: true;
};

export type AddCardToBoardFail = {
    ok: false;
    error: string;
};

export type AddCardToBoardResults = AddCardToBoardSuccess | AddCardToBoardFail;

/**
 * Adds card to the selected board
 *
 * This function will invoke the correct Redux dispatches and
 * API requests in order to succesffully add the a new card to a deck's
 * mainboard.
 *
 * DISCLAIMER:
 *
 * Like most of the functionality of this extension, this function in particular
 * is extremely fragile, any subtle changes to the Moxfield API / State management
 * WILL break it, but there is really nothing I can do about that.
 */
export async function addCardToMainboard(
    deck: DeckResponse,
    card: ScryfallCard & MoxfieldCard,
    accessToken: string
): Promise<AddCardToBoardResults> {
    if (!card) {
        return {
            ok: false,
            error: "The card was null"
        };
    }

    const request = {
        url: `/v2/decks/n4nPKx/cards/mainboard`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Public-Deck-ID": deck.publicId,
            "X-Deck-Version": deck.version
        },
        data: {
            cardId: card.id,
            quantity: 1,
            usePrefPrinting: true
        },
        withCredentials: true,
        signal: {}
    };

    let success = await reduxDispatch({
        type: "ADD_CARD_TO_BOARD_BEGIN",
        deck: deck,
        board: "mainboard",
        card: card,
        quantity: 1,
        authenticate: true,
        request
    });

    if (!success) {
        return {
            ok: false,
            error: "Failed to ADD_CARD_TO_BOARD_BEGIN"
        };
    }

    const res = await MOXFIELD_API.mainboard(
        {
            cardId: card.id,
            quantity: 1,
            userPrefPrinting: true
        },
        deck.id,
        accessToken
    ).catch((err) => console.error(err));

    if (!res || !res.card) {
        return {
            ok: false,
            error: "Adding card to mainboard was not successfull"
        };
    }

    success = await reduxDispatch({
        type: "ADD_CARD_TO_BOARD_END",
        data: {
            tags: [],
            collection: "",
            card: res.card,
            tokens: [],
            boardType: "mainboard"
        },
        headers: {
            "cache-control": "no-store",
            "content-type": "application/json; charset=utf-8",
            "x-deck-has-changed": "false",
            "x-deck-version": deck.version + 1 //Assumed version increment here
        },

        //NOTE TO SELF:
        //   The origin is just the ADD_CARD_TO_BOARD_BEGIN
        //   action object but with type changed to ADD_CARD_TO_BOARD

        origin: {
            type: "ADD_CARD_TO_BOARD",
            deck: deck,
            board: "mainboard",
            card: card,
            quantity: 1,
            authenticate: true,
            request
        }
    });

    if (!success) {
        return {
            ok: false,
            error: "Failed to ADD_CARD_TO_BOARD_END"
        };
    }

    return {
        ok: true
    };
}
