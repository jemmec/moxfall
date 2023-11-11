function waitFor(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

export const forceUpdateElement = async (elementId: string): Promise<void> => {
    const element = document.getElementById(elementId);
    console.log(`forcing element ${elementId} to refresh`, element);
    if (element) {
        const originalDisplay = element.style.display;
        element.style.display = "none";
        const _ = element.offsetHeight;
        await waitFor(1000);
        element.style.display = originalDisplay;
    }
};
