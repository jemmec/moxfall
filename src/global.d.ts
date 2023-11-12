/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface CustomEventMap {
    locationchanged: CustomEvent<LocationChangeEvent>;
}
