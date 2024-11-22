import { registerPlugin } from "./SmartMonkeyCore.js";

registerPlugin({
  id: "planner-in-topnav",
  info: {
    name: "Planner ipv Vakken in topnav",
    description: "Vervangt de knop voor 'Vakken' met 'Planner'",
    version: "v0.1",
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
