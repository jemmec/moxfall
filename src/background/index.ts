import { ReduxAction, ReduxStore, RuntimeMessage, RuntimeMessageResponse } from "../lib/types";

console.log("Background service started!");

function reduxInjectionFn(type: string, arg?: any): RuntimeMessageResponse {
    const ELEMENT_ID = "js-reactroot";
    const reactRoot = document.getElementById(ELEMENT_ID) as any; // Force any here

    if (!reactRoot) {
        console.error(`The react root for ${ELEMENT_ID} was null!`);
        return {
            ok: false,
            type
        };
    }

    let reactContainerKey: string | null = null;

    for (const key in reactRoot) {
        if (key.includes("__reactContainer$")) {
            reactContainerKey = key;
        }
    }

    if (reactContainerKey === null) {
        console.error("Failed to find react container on moxfiledApp");
        return {
            ok: false,
            type
        };
    }

    const moxfieldApp = reactRoot[reactContainerKey];

    try {
        const store = moxfieldApp.memoizedState.element.props.children.props.store as ReduxStore;

        if (!store) {
            console.error("Redux store was undefined");
            return {
                ok: false,
                type
            };
        }

        switch (type) {
            case "dispatch": {
                const a = JSON.parse(arg) as ReduxAction;
                store.dispatch(a);
                return {
                    ok: true,
                    type
                };
            }
            case "getstate": {
                return {
                    ok: true,
                    type,
                    state: store.getState()
                };
            }
            default:
                return {
                    ok: false,
                    type
                };
        }
    } catch (err) {
        console.error("Injection function failed: " + err);
        return {
            ok: false,
            type
        };
    }
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
    switch (message.type) {
        case "echo":
            //TODO
            break;
        case "inject":
            break;
        case "dispatch":
            {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTabId = tabs[0] ? tabs[0].id ?? -1 : -1;
                    chrome.scripting.executeScript<[string, string], RuntimeMessageResponse>(
                        {
                            world: "MAIN",
                            target: { tabId: activeTabId },
                            args: [message.type, JSON.stringify(message.action)],
                            func: reduxInjectionFn
                        },
                        (results) => {
                            chrome.tabs.sendMessage<RuntimeMessageResponse>(
                                activeTabId,
                                results[0].result
                            );
                        }
                    );
                });
            }
            break;
        case "getstate": {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTabId = tabs[0] ? tabs[0].id ?? -1 : -1;
                chrome.scripting.executeScript<[string], RuntimeMessageResponse>(
                    {
                        world: "MAIN",
                        target: { tabId: activeTabId },
                        args: [message.type],
                        func: reduxInjectionFn
                    },
                    (results) => {
                        chrome.tabs.sendMessage<RuntimeMessageResponse>(
                            activeTabId,
                            results[0].result
                        );
                    }
                );
            });
        }
        default:
            break;
    }
});
