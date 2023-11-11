console.log("Moxfall contentScript loaded.");

import ReactDOM from "react-dom/client";
import Content from "./Content";
import "../globals.css";
import { RuntimeMessage, RuntimeMessageResponse } from "../lib/types";

const body = document.body as HTMLBodyElement;
body.style.position = "relative";
body.id = "moxfall-body";
const app = document.createElement("div");
app.id = "moxfall-drop-intercepter";
body.append(app);

ReactDOM.createRoot(app as HTMLElement).render(<Content />);

export const send = chrome.runtime.sendMessage<RuntimeMessage, RuntimeMessageResponse>;

send(
    {
        type: "echo",
        message: "Hello background"
    },
    (response) => {
        console.log(`Runtime response: ${response}`);
    }
);

send({
    type: "dispatch",
    action: "UPDATE",
    payload: {}
});
