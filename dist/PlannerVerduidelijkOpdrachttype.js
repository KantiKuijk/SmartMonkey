import { PluginMain, registerPlugin } from "./Plugins.js";
const id = "planner-duidelijk-opdrachttype";
const plugin = new PluginMain({
    id,
    version: "v0.1",
    inUseDefault: true,
    info: {
        name: "Planner: Duidelijk opdrachttype",
        description: "Toont het opdrachttype duidelijker wanneer je start vanaf een lege opdracht.",
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
//# sourceMappingURL=PlannerVerduidelijkOpdrachttype.js.map