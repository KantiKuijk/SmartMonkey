import { emmet } from "./emmet.js";
import { PluginMain } from "./PluginClasses.js";
import { registerPlugin } from "./SmartMonkeyCore.js";
import { getUserIDs } from "./SmartMonkeyHelpers.js";

const BEGINUREN = [
  "0:00",
  "1:00",
  "2:00",
  "3:00",
  "4:00",
  "5:00",
  "6:00",
  "7:00",
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
] as const;
type BeginUur = (typeof BEGINUREN)[number];
const BEGINDAGEN = ["Vrijdag", "Zaterdag", "Zondag"] as const;
type BeginDag = (typeof BEGINDAGEN)[number];

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
    interface PluginsSettings {
      [id]: { beginDag: BeginDag; beginUur: BeginUur };
    }
  }
}

const id = "planner-weekend-volgende-week" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.2",
  inUseDefault: true,
  info: {
    name: "Planner: Toon komende week",
    description:
      "Zorgt dat tijdens het weekend de planner standaard gaat naar de week die komt i.p.v. de afgelopen week.",
    author: "Kanti Kuijk",
  },
  activate: async function () {
    const href =
      window.performance.getEntriesByType("navigation")[0]?.name ??
      window.location.href;
    const date = new Date();
    const hour = date.getHours();
    const day = (date.getDay() + 6) % 7;
    const beginDag = 4 + BEGINDAGEN.indexOf(this.user.settings.beginDag);
    const beginUur = parseInt(this.user.settings.beginUur.slice(0, 2));
    if (
      /^https:\/\/[a-zA-Z]+\.smartschool\.be\/planner\/?$/.test(href) &&
      (day > beginDag || (day === beginDag && hour >= beginUur))
    ) {
      const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      const [year, month, day] = [
        nextWeek.getFullYear(),
        nextWeek.getMonth() + 1,
        nextWeek.getDate(),
      ].map((n) => n.toString().padStart(2, "0"));
      const newHref = `${href}/main/user/${
        (await getUserIDs()).idString
      }/${year}-${month}-${day}`;
      window.location.href = newHref;
    }
  },
  settingsDefault: { beginDag: "Zaterdag", beginUur: "0:00" },
  changeSettings: async function () {
    return new Promise((resolve) => {
      const settings = this.user.settings;
      let { beginDag, beginUur } = settings;
      const saveSettingsBtn = emmet<"button">`
      button.smscButton.blue{Sluiten}
      `;
      saveSettingsBtn.addEventListener("click", () => {
        settingsDialog.close();
        resolve({ beginDag, beginUur });
      });
      const dagOpts = BEGINDAGEN.map(
        (dag) =>
          `option[value=${dag}]{${dag}}${dag === beginDag ? "[selected]" : ""}`
      ).join("+");
      const dagPicker = emmet<"select">`
        select#smk-dag
          >${dagOpts}
      `;
      dagPicker.addEventListener("change", () => {
        beginDag = dagPicker.value as BeginDag;
      });
      const uurOpts = BEGINUREN.map(
        (uur) =>
          `option[value=${uur}]{${uur}}${uur === beginUur ? "[selected]" : ""}`
      ).join("+");
      const uurPicker = emmet<"select">`
        select#smk-uur
          >${uurOpts}
      `;
      uurPicker.addEventListener("change", () => {
        beginUur = uurPicker.value as BeginUur;
      });
      const settingsDialog = emmet<"dialog">`
          dialog#smk-settings
            >h3{Planner: Toon komende week}
            +h4{Ga naar de volgende week vanaf:}
            +${dagPicker}
            +${uurPicker}
            +div.smscButtonContainer[style="margin-top:1em;"]
              >${saveSettingsBtn}
          `;
      document.body.append(settingsDialog);

      settingsDialog.showModal();
    });
  },
});

registerPlugin(plugin);
