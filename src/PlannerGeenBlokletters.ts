import { PluginMain } from "./PluginClasses.js";
import { registerPlugin } from "./SmartMonkeyCore.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

const id = "planner-geen-blokletters" as const;
const plugin = new PluginMain<typeof id>({
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
      let css =
          ".brief-ple-content .brief-ple-content__info{text-transform:initial}",
        head = document.head || document.getElementsByTagName("head")[0],
        style = document.createElement("style");
      head.appendChild(style);
      style.appendChild(document.createTextNode(css));
    }
  },
});

registerPlugin(plugin);
