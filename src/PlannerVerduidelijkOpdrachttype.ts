import { PluginMain } from "./PluginClasses.js";
import { registerPlugin } from "./SmartMonkeyCore.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

const id = "planner-duidelijk-opdrachttype" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: true,
  info: {
    name: "Planner: Duidelijk opdrachttype",
    description:
      "Toont het opdrachttype duidelijker wanneer je start vanaf een lege opdracht.",
    author: "Kanti Kuijk",
  },
  activate: () => {
    const style = document.createElement("style");
    style.textContent = `
      .btn.js-assignment-type-button.btn--select-dropdown--show-on-hover:not(:hover) {
        border-color: revert;
      }
    `;
    document.head.appendChild(style);
  },
});

registerPlugin(plugin);
