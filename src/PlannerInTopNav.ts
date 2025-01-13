import { PluginMain } from "./PluginClasses.js";
import { registerPlugin } from "./SmartMonkeyCore.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

const id = "planner-in-topnav" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: true,
  info: {
    name: "Planner: Knop in bovenbalk",
    description: "Vervangt in de bovenbalk de knop 'Vakken' met 'Planner'",
    author: "Kanti Kuijk",
  },
  activate: () => {
    const plannerLinkHTML =
      '<a href="/planner" class="js-btn-shortcuts topnav__btn">Planner</a>';
    const vakkenButton = Array.from(
      document.querySelectorAll(".topnav__btn")
    ).find(
      (b) =>
        b instanceof HTMLElement &&
        b.innerText &&
        b.innerText.includes("Vakken")
    );
    if (!vakkenButton) console.warn("Kon vakken niet vinden");
    else vakkenButton.outerHTML = plannerLinkHTML;
  },
});

registerPlugin(plugin);
