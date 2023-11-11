type EchoMessage = {
    type: "echo";
    message: string;
};

type InjectStateMessage = {
    type: "inject";
    attribute: string;
    value: string;
};

type ForceDispatchReduxMessage = {
    type: "dispatch";
    action: string;
    payload: any;
};

export type RuntimeMessage = EchoMessage | InjectStateMessage | ForceDispatchReduxMessage;

export type RuntimeMessageResponse = string;
