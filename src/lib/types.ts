type EchoMessage = {
    type: "echo";
    message: string;
};

type InjectStateMessage = {
    type: "inject";
    elementId: string;
    attribute: string;
    value: string;
};

type ReduxDispatchMessage = {
    type: "dispatch";
    action: ReduxAction;
};

type ReduxPrintStateMessage = {
    type: "printstate";
};

export type RuntimeMessage =
    | EchoMessage
    | InjectStateMessage
    | ReduxDispatchMessage
    | ReduxPrintStateMessage;

export type RuntimeMessageResponse = string;

export type MoxfieldCard = any;

export type ReduxAction = {
    type: string;
    payload: any;
};

export type ReduxStore = {
    dispatch: (action: ReduxAction) => void;
    getState: () => any;
};
