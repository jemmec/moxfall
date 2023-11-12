type Echo = {
    type: "echo";
    message: string;
};

type InjectState = {
    type: "inject";
    elementId: string;
    attribute: string;
    value: string;
};

type ReduxDispatch = {
    type: "dispatch";
    action: ReduxAction;
};

type ReduxGetState = {
    type: "getstate";
};

export type RuntimeMessage = Echo | InjectState | ReduxDispatch | ReduxGetState;

export type RuntimeMessageWithCallerId = { callerId: string } & RuntimeMessage;

export type RuntimeMessageResponse = {
    type: string;
    ok: boolean;
    [key: string | number | symbol]: any;
};

export type RuntimeMessageResponseWithCallerId = {
    callerId: string;
} & RuntimeMessageResponse;

export type ScryfallCard = {
    artist: string;
    scryfall_id: string;
    set: string;
    name: string;
};

export type MoxfieldCard = {
    id: string;
    uniqueCardId: string;
};

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

export type ReduxAction = {
    type: string;
    [key: string | number | symbol]: unknown;
};

export type ReduxStore = {
    dispatch: (action: ReduxAction) => void;
    getState: () => any;
};
