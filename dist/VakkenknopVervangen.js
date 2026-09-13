import { emmet } from "./emmet.js";
import { PluginMain, registerPlugin } from "./Plugins.js";
import { getModules } from "./Helpers.js";
const id = "vakkenknop-vervangen";
const plugin = new PluginMain({
    id,
    version: "v0.1",
    inUseDefault: true,
    info: {
        name: "Nav: Vakkenknop vervangen",
        description: "Vervangt in de bovenbalk de knop 'Vakken' met een andere link",
        author: "Kanti Kuijk",
    },
    activate: async (settings) => {
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        debugger;
        const vakkenButton = Array.from(document.querySelectorAll(".topnav__btn")).find((b) => b instanceof HTMLElement &&
            b.innerText &&
            b.innerText.includes("Vakken"));
        if (!vakkenButton)
            console.warn("Kon vakken-knop niet vinden");
        else {
            console.log("Vervang vakken-knop met", settings.vervangMet);
            if (settings.vervangMet === "verwijder") {
                vakkenButton.remove();
            }
            else {
                debugger;
                const module = (await getModules()).find((m) => m.id === settings.vervangMet);
                if (module === undefined)
                    return console.warn(`Kon module met id ${settings.vervangMet} niet vinden`);
                const vervangLinkHTML = `<a href="${module.href}" class="js-btn-shortcuts topnav__btn">${module.display}</a>`;
                vakkenButton.outerHTML = vervangLinkHTML;
            }
        }
    },
    settingsDefault: { vervangMet: "verwijder" },
    changeSettings: async function () {
        return new Promise(async (resolve) => {
            const settings = this.user.settings;
            let { vervangMet } = settings;
            const saveSettingsBtn = emmet `
      button.smscButton.blue{Sluiten}
      `;
            saveSettingsBtn.addEventListener("click", () => {
                settingsDialog.close();
                resolve({ vervangMet });
            });
            const smscModules = (await getModules({ smartschool: true })).sort((a, b) => a.display.localeCompare(b.display));
            const linkModules = (await getModules({ link: true })).sort((a, b) => a.display.localeCompare(b.display));
            const smscModulesOpts = smscModules
                .map((module) => `option[value=${module.id}]{${module.display}}${module.id === vervangMet ? "[selected]" : ""}`)
                .join("+");
            const linkModulesOpts = linkModules
                .map((module) => `option[value=${module.id}]{${module.display}}${module.id === vervangMet ? "[selected]" : ""}`)
                .join("+");
            const modulePicker = emmet `
        select#smk-dag
          >option{~ Smartschool modules ~}[disabled]
          +${smscModulesOpts}
          +option{~ Externe links ~}[disabled]
          +${linkModulesOpts}
          +option{~ Verwijder knop ~}[disabled]
          +option[value=verwijder]{Verwijder vakken}${"verwijder" === vervangMet ? "[selected]" : ""}
      `;
            modulePicker.addEventListener("change", () => {
                vervangMet = modulePicker.value;
            });
            const settingsDialog = emmet `
          dialog#smk-settings
            >h3{Nav: Vakkenknop vervangen}
            +h4{Vervang de knop 'Vakken' in de bovenbalk met:}
            +${modulePicker}
            +div.smscButtonContainer[style="margin-top:1em;"]
              >${saveSettingsBtn}
          `;
            document.body.append(settingsDialog);
            settingsDialog.showModal();
        });
    },
});
registerPlugin(plugin);
//# sourceMappingURL=VakkenknopVervangen.js.map