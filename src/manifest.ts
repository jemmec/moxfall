import { defineManifest } from "@crxjs/vite-plugin";
import packageData from "../package.json";

export default defineManifest({
    name: packageData.name,
    description: packageData.description,
    version: packageData.version,
    manifest_version: 3,
    icons: {
        16: "img/logo-16.png",
        32: "img/logo-34.png",
        48: "img/logo-48.png",
        128: "img/logo-128.png"
    },
    action: {
        default_popup: "popup.html",
        default_icon: "img/logo-48.png"
    },
    // options_page: 'options.html',
    background: {
        service_worker: "src/background/index.ts",
        type: "module"
    },
    content_scripts: [
        {
            run_at: "document_end",
            matches: ["http://www.moxfield.com/*", "https://www.moxfield.com/*"],
            js: ["src/contentScript/index.tsx"]
        }
    ],
    web_accessible_resources: [
        {
            resources: [
                "img/logo-16.png",
                "img/logo-34.png",
                "img/logo-48.png",
                "img/logo-128.png"
            ],
            matches: []
        }
    ],
    host_permissions: ["http://www.moxfield.com/*", "https://www.moxfield.com/*"],
    permissions: ["storage", "scripting", "activeTab", "tabs"]
});
