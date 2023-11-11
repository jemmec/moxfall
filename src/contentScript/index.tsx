console.log("Moxfall contentScript loaded.");

import ReactDOM from "react-dom/client";
import Content from "./Content";
import "../globals.css";
import { ReduxAction, RuntimeMessage, RuntimeMessageResponse } from "../lib/types";

type ResponseFn = (response: RuntimeMessageResponse) => void;

export const serviceEcho = (message: string, response: ResponseFn) =>
    chrome.runtime.sendMessage<RuntimeMessage, RuntimeMessageResponse>(
        {
            type: "echo",
            message
        },
        response
    );

export const reduxDispatch = (action: ReduxAction): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
        chrome.runtime.sendMessage<RuntimeMessage, RuntimeMessageResponse>(
            {
                type: "dispatch",
                action
            },
            (res) => resolve(res.ok)
        );
    });
};

export const reduxPrintState = (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        chrome.runtime.sendMessage<RuntimeMessage, RuntimeMessageResponse>(
            {
                type: "printstate"
            },
            (res) => {
                if (!res.message) {
                    reject();
                    return;
                }
                resolve(res.message);
            }
        );
    });
};

const body = document.body as HTMLBodyElement;
body.style.position = "relative";
body.id = "moxfall-body";
const app = document.createElement("div");
app.id = "moxfall-drop-intercepter";
body.append(app);

ReactDOM.createRoot(app as HTMLElement).render(<Content />);
