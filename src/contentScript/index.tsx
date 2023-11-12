console.log("Moxfall contentScript loaded.");

import ReactDOM from "react-dom/client";
import Content from "./Content";
import "../globals.css";
import {
    ReduxAction,
    RuntimeMessage,
    RuntimeMessageResponse,
    RuntimeMessageResponseWithCallerId,
    RuntimeMessageWithCallerId
} from "../lib/types";

const body = document.body as HTMLBodyElement;
body.style.position = "relative";
const app = document.createElement("div");
app.id = "drop-intercept";
body.append(app);

ReactDOM.createRoot(app as HTMLElement).render(<Content />);

function genCallerId(length: number): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let ret = "";
    for (let i = 0; i < length; i++) {
        const rngIdx = Math.floor(Math.random() * characters.length);
        ret += characters.charAt(rngIdx);
    }
    return ret;
}

function internalActionMessage(message: RuntimeMessage): Promise<RuntimeMessageResponse> {
    return new Promise((resolve, reject) => {
        //generate unique caller id
        const callerId = genCallerId(6);

        chrome.runtime.sendMessage<RuntimeMessageWithCallerId>({
            ...message,
            callerId
        });

        const handle = (response: RuntimeMessageResponseWithCallerId) => {
            if (response.callerId !== callerId && response.type !== message.type) {
                return;
            }
            if (!response.ok) {
                reject();
                return;
            }
            resolve(response as any);
            chrome.runtime.onMessage.removeListener(handle);
        };

        chrome.runtime.onMessage.addListener(handle);
    });
}

export function reduxDispatch(action: ReduxAction): Promise<boolean> {
    return internalActionMessage({
        type: "dispatch",
        action
    }).then((res) => res.ok);
}

export function reduxGetState(): Promise<any> {
    return internalActionMessage({
        type: "getstate"
    }).then((res) => res.state);
}

export function serviceEcho(message: string): Promise<string> {
    return internalActionMessage({
        type: "echo",
        message: message
    }).then((res) => res.message);
}
