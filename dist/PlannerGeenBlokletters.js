import { PluginMain, registerPlugin } from "./Plugins.js";
const id = "planner-geen-blokletters";
const plugin = new PluginMain({
    id,
    version: "v1",
    inUseDefault: true,
    info: {
        name: "Planner: Geen blokletters",
        description: "Maakt in de planner van blokletters gewone letter.",
        author: "Kanti Kuijk",
    },
    activate: () => {
        const timegrid = document.querySelector(".timegrid.timegridcontainer");
        if (timegrid) {
            let css = ".brief-ple-content .brief-ple-content__info{text-transform:initial}", head = document.head || document.getElementsByTagName("head")[0], style = document.createElement("style");
            head.appendChild(style);
            style.appendChild(document.createTextNode(css));
        }
    },
});
registerPlugin(plugin);
//# sourceMappingURL=PlannerGeenBlokletters.js.map