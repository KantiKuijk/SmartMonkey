import { emmet } from "./emmet.js";
import { PluginMain } from "./PluginClasses.js";
import { registerPlugin } from "./SmartMonkeyCore.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
    interface PluginsSettings {
      [id]: { duurtijd: number };
    }
  }
}

const id = "todo-duurtijd" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: true,
  info: {
    name: "Todo: Standaard duurtijd",
    description: "Verander de standaard duurtijd van aan to-do.",
    author: "Kanti Kuijk",
  },
  activate: async function (settings) {
    const href =
      window.performance.getEntriesByType("navigation")[0]?.name ??
      window.location.href;
    if (!/^https:\/\/[a-zA-Z]+\.smartschool\.be\/planner\/?/.test(href)) return;

    const { duurtijd } = settings;

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLDivElement && node.hasAttribute("dialog")) {
              debugger;
              const periodInput = node.querySelector(".todo .period-input");
              if (!periodInput) return;
              const velden: NodeListOf<HTMLInputElement> =
                periodInput.querySelectorAll("input.timeinput");
              const [begin, eind] = [velden[0], velden[1]];
              if (!begin || !eind) return;
              let [uur, min] = begin.value.split(":").map(Number);
              if (!uur || !min || isNaN(uur) || isNaN(min)) return;
              min += duurtijd;
              uur += Math.floor(min / 60);
              min %= 60;
              if (uur > 23) [uur, min] = [23, 59];
              eind.value = `${String(uur).padStart(2, "0")}:${String(
                min
              ).padStart(2, "0")}`;
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true, // Observe direct child additions/removals
      subtree: true, // Observe all descendants
    });
  },
  settingsDefault: { duurtijd: 30 },
  changeSettings: async function () {
    return new Promise((resolve) => {
      const settings = this.user.settings;
      let { duurtijd } = settings;
      const saveSettingsBtn = emmet<"button">`
      button.smscButton.blue{Sluiten}
      `;
      saveSettingsBtn.addEventListener("click", () => {
        settingsDialog.close();
        resolve({ duurtijd });
      });
      const duurtijdVeld = emmet<"input">`
        input#smk-duurtijd[type=number][min=0][max=300][step=5][value=${String(
          duurtijd
        )}]
      `;
      duurtijdVeld.addEventListener("change", () => {
        duurtijd = Number(duurtijdVeld.value);
      });
      const settingsDialog = emmet<"dialog">`
          dialog#smk-settings
            >h3{Todo: Standaard duurtijd}
            +h4{De lengte van een nieuwe to-do in minuten:}
            +${duurtijdVeld}
            +div.smscButtonContainer[style="margin-top:1em;"]
              >${saveSettingsBtn}
          `;
      document.body.append(settingsDialog);

      settingsDialog.showModal();
    });
  },
});

registerPlugin(plugin);
