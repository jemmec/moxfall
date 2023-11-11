console.log("Moxfall contentScript loaded.");

import ReactDOM from "react-dom/client";
import Content from "./Content";
import "../globals.css";

const body = document.body as HTMLBodyElement;
body.style.position = "relative";
const app = document.createElement("div");
app.id = "drop-intercept";
body.append(app);

ReactDOM.createRoot(app as HTMLElement).render(<Content />);
