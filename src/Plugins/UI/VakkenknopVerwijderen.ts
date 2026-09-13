import { PluginMain, registerPlugin } from "../../Core/Plugins.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

const id = "vakkenknop-verwijderen" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: true,
  info: {
    name: "Nav: Vakkenknop verwijderen",
    description: "Verwijdert in de bovenbalk de knop 'Vakken'",
    author: "Kanti Kuijk",
  },
  activate: async () => {
    const vakkenButton = Array.from(
      document.querySelectorAll(".topnav__btn"),
    ).find(
      (b) =>
        b instanceof HTMLElement &&
        b.innerText &&
        b.innerText.includes("Vakken"),
    );
    if (!vakkenButton) console.warn("Kon vakken-knop niet vinden");
    else vakkenButton.remove();
  },
});

registerPlugin(plugin);
