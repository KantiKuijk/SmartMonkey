import { PluginMain, registerPlugin } from "./Plugins.js";
const id = "hotkeys";
const plugin = new PluginMain({
    id,
    version: "v0.1.1",
    inUseDefault: true,
    info: {
        name: "Hotkeys",
        description: "Gebruik hotkeys om snel naar pagina's te gaan.",
        author: "Kanti Kuijk",
    },
    activate: async function () {
        document.addEventListener("keydown", function (event) {
            console.log(event);
            console.log(event.altKey, event.shiftKey, event.code);
            if (event.altKey && event.shiftKey) {
                // Check for Control + Option (Alt)
                const path = {
                    KeyP: "planner",
                    KeyS: "SkoreGradebook",
                    KeyA: "Presence",
                    KeyB: "?module=Messages",
                    KeyF: "lesson-content",
                    KeyH: "",
                    KeyI: "intradesk",
                    KeyL: "?module=LVS",
                    KeyO: "parent-contact/cards",
                    KeyR: "?module=Reservation",
                    KeyT: "helpdesk#!tickets",
                }[event.code];
                if (typeof path === "string") {
                    (window.top ?? window.parent).location.href =
                        `https://${window.location.host}/${path}`;
                }
            }
        });
    },
});
registerPlugin(plugin);
//# sourceMappingURL=Hotkeys.js.map