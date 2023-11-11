import { RuntimeMessage, RuntimeMessageResponse } from "../lib/types";
import { waitFor } from "../lib/utils";

console.log("Background service started!");

chrome.runtime.onMessage.addListener(
    (
        message: RuntimeMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: RuntimeMessageResponse) => void
    ) => {
        switch (message.type) {
            case "echo":
                sendResponse(message.message);
                break;
            case "inject":
                break;
            case "dispatch":
                {
                    console.log("Attempting to call dispatch on redux state, wish me some luck!");
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const activeTab = tabs[0];
                        chrome.scripting.executeScript(
                            {
                                world: "MAIN",
                                target: { tabId: activeTab.id ?? -1 },
                                func: async () => {
                                    await waitFor(1000);
                                    console.log("I AM INSIDE YOUR BROWSER MUAHHAAHAH");
                                }
                            },
                            (results: chrome.scripting.InjectionResult<void>[]) => {
                                console.log("results", results);
                            }
                        );
                    });
                }
                break;
            default:
                break;
        }
    }
);
