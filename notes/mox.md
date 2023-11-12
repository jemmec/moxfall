# Moxfield app notes

### Overview

The app is using `React` + `Redux`, heavly reliant on redux action to update state.

Looks like the typical hydration cycle is `DO_ACTION_BEGIN` -> `make request` -> `DO_ACTION_END`. Not all action have a `BEGIN` and `END`, and not all actions requre a request.

### Redux Actions

I've investigated various actions and found that adding cards to a board use the `ADD_CARD_TO_BOARD_BEGIN/END` actions.

```ts
    type: "ADD_CARD_TO_BOARD",
    deck: e,
    board: n,
    card: r,
    authenticate: !0,
    quantity: l,
    request: {
        url: "/v2/decks/".concat(e.id, "/cards/").concat(n),
        method: "POST",
        headers: {
            "X-Public-Deck-ID": e.publicId,
            "X-Deck-Version": e.version
        },
        data: {
            cardId: r.id,
            quantity: l,
            printingData: o,
            usePrefPrinting: i
        }
    }
```

```ts
    type: "GET_CARD",
    id: e,
    request: {
        url: "/v2/cards/details/".concat(e)
    }
```

Still looking for a simple action to "reload" the deck from database, rather than rely on local state (because I cant assume I am doing everything correctly, at this point).

`GET_DECK_HISTORY_END` Looks interesting

`INITIALIZE` Might trigger a reload of the deck??

SET_DECK_VIEWOPTIONS_FOROTHERS //
