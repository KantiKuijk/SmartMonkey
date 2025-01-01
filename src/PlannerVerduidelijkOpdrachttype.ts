import { registerPlugin } from "./SmartMonkeyCore.js";

registerPlugin({
  id: "planner-duidelijk-opdrachttype",
  info: {
    name: "Planner: Duidelijk opdrachttype",
    description:
      "Toont het opdrachttype duidelijker wanneer je start vanaf een lege opdracht.",
    version: "v0.1",
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
