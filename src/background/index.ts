console.log("background is running");

const injectFn = () => {
    console.log("Code successfully inject!");
};

(async () => {
    const activeTab = (await chrome.tabs.query({ currentWindow: true, active: true }))[0].id;

    if (!activeTab) {
        console.error("Active tab is undefined");
        return;
    }

    chrome.scripting.executeScript({
        world: "MAIN",
        target: { tabId: activeTab },
        func: injectFn
    });
})();
