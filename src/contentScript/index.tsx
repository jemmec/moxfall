console.log("Moxfall contentScript loaded.");

import ReactDOM from "react-dom/client";
import Content from "./Content";
import "../globals.css";
import { ReduxAction, RuntimeMessage, RuntimeMessageResponse } from "../lib/types";

export const service_echo = (
    message: string,
    response: (response: RuntimeMessageResponse) => void
) =>
    chrome.runtime.sendMessage<RuntimeMessage, RuntimeMessageResponse>(
        {
            type: "echo",
            message
        },
        response
    );

export const reduxDispatch = (action: ReduxAction) =>
    chrome.runtime.sendMessage<RuntimeMessage, RuntimeMessageResponse>({
        type: "dispatch",
        action
    });

export const reduxPrintState = () =>
    chrome.runtime.sendMessage<RuntimeMessage, RuntimeMessageResponse>({
        type: "printstate"
    });

const body = document.body as HTMLBodyElement;
body.style.position = "relative";
body.id = "moxfall-body";
const app = document.createElement("div");
app.id = "moxfall-drop-intercepter";
body.append(app);

ReactDOM.createRoot(app as HTMLElement).render(<Content />);
