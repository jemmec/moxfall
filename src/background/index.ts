import { ReduxAction, ReduxStore, RuntimeMessage, RuntimeMessageResponse } from "../lib/types";

console.log("Background service started!");

const injectionFn = (type: string, arg?: any): boolean => {
    const ELEMENT_ID = "js-reactroot";
    const reactRoot = document.getElementById(ELEMENT_ID) as any; // Force any here

    if (!reactRoot) {
        console.error(`The react root for ${ELEMENT_ID} was null!`);
        return false;
    }

    let reactContainerKey: string | null = null;

    for (const key in reactRoot) {
        if (key.includes("__reactContainer$")) {
            reactContainerKey = key;
        }
    }

    if (reactContainerKey === null) {
        console.error("Failed to find react container on moxfiledApp");
        return false;
    }

    const moxfieldApp = reactRoot[reactContainerKey];

    try {
        const store = moxfieldApp.memoizedState.element.props.children.props.store;

        if (!store) {
            console.error("Redux store was undefined");
            return false;
        }

        switch (type) {
            case "dispatch": {
                const a = JSON.parse(arg) as ReduxAction;
                console.log("action", a);
                store.dispatch(a);
            }
            case "printstate": {
                console.log("Redux Store", store.getState());
            }
        }
    } catch (err) {
        console.log("Injection function failed: " + err);
    }

    console.log("Successfully completed injection");

    return true;
};

chrome.runtime.onMessage.addListener(
    (
        message: RuntimeMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: RuntimeMessageResponse) => void
    ) => {
        switch (message.type) {
            case "echo":
                sendResponse({
                    ok: true,
                    message: message.message
                });
                break;
            case "inject":
                break;
            case "dispatch":
                {
                    console.log("Attempting to call dispatch on redux state, wish me some luck!");
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const activeTab = tabs[0];
                        chrome.scripting.executeScript<[string, string], boolean>({
                            world: "MAIN",
                            target: { tabId: activeTab.id ?? -1 },
                            args: [message.type, JSON.stringify(message.action)],
                            func: injectionFn
                        });
                        sendResponse({
                            ok: true
                        });
                    });
                }
                break;
            case "printstate": {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTab = tabs[0];
                    chrome.scripting.executeScript<[string], boolean>({
                        world: "MAIN",
                        target: { tabId: activeTab.id ?? -1 },
                        args: [message.type],
                        func: injectionFn
                    });
                    sendResponse({
                        ok: true
                    });
                });
            }
            default:
                break;
        }
    }
);
