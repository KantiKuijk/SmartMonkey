import { emmet } from "../../Core/emmet.js";
import { PluginMain, registerPlugin } from "../../Core/Plugins.js";
import { getModules } from "../../Core/Helpers.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
    interface PluginsSettings {
      [id]: string[];
    }
  }
}

const id = "Navknoppen-toevoegen" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: false,
  info: {
    name: "Nav: Knoppen toevoegen",
    description: "Voegt in de bovenbalk knoppen toe uit 'Ga naar' of 'Links'",
    author: "Kanti Kuijk",
  },
  activate: async (settings) => {
    const favsBar = document.querySelector<HTMLDivElement>(
      "#smscTopContainer>nav>div.favourites-container",
    );
    if (!favsBar) console.warn("Kon favorietenbalk niet vinden");
    else {
      const modules = await getModules({ smartschool: true, link: true });
      settings.forEach(async (moduleId) => {
        const module = modules.find((m) => m.id === moduleId);
        if (module === undefined)
          return console.warn(`Kon module met id ${moduleId} niet vinden`);
        const vervangLinkHTML = `<a href="${module.href}" ${module.target ? `target="${module.target}"` : ""} class="js-btn-shortcuts topnav__btn">${module.display}</a>`;
        favsBar.insertAdjacentHTML("beforeend", vervangLinkHTML);
      });
      favsBar.insertAdjacentHTML("beforeend", '<hr class="topnav__divider">');
    }
  },
  settingsDefault: [],
  changeSettings: async function () {
    return new Promise(async (resolve) => {
      const settings = this.user.settings;
      const saveSettingsBtn = emmet<"button">`
      button.smscButton.blue{Opslaan}
      `;
      saveSettingsBtn.addEventListener("click", () => {
        settingsDialog.close();
        resolve(settings);
      });
      const smscModules = (await getModules({ smartschool: true })).sort(
        (a, b) => a.display.localeCompare(b.display),
      );
      const linkModules = (await getModules({ link: true })).sort((a, b) =>
        a.display.localeCompare(b.display),
      );
      const makeModuleOpts = (index: number, selectedId?: string) => {
        const smscModulesOpts = smscModules
          .map(
            (module) =>
              `option[value=${module.id}]{${module.display}}${module.id === selectedId ? "[selected]" : ""}`,
          )
          .join("+");
        const linkModulesOpts = linkModules
          .map(
            (module) =>
              `option[value=${module.id}]{${module.display}}${module.id === selectedId ? "[selected]" : ""}`,
          )
          .join("+");
        const modulePicker = emmet<"select">`
        select#smk-fav-module-${String(index)}
          >option{* Kies module *}[disabled]
          +option{~ Smartschool modules ~}[disabled]
          +${smscModulesOpts}
          +option{~ Externe links ~}[disabled]
          +${linkModulesOpts}
      `;
        modulePicker.addEventListener("change", () => {
          settings[index] = modulePicker.value;
        });

        const removeModuleBtn = emmet<"button">`button.smscButton.red{–}`;
        removeModuleBtn.addEventListener("click", () => {
          settings.splice(index, 1);
          modulePickersContainer.remove();
        });
        const modulePickersContainer = emmet<"div">`div#smk-module-pickers-container-${String(index)}>${modulePicker}+${removeModuleBtn}`;
        return modulePickersContainer;
      };
      const modulePickersContainer = emmet<"div">`
        div#smk-modules-pickers-container
      `;
      settings.forEach((moduleId, index) => {
        const modulePicker = makeModuleOpts(index, moduleId);
        modulePickersContainer.append(modulePicker);
      });
      const addModuleBtn = emmet<"button">`button.smscButton.blue{+}`;
      addModuleBtn.addEventListener("click", () => {
        const newModulePicker = makeModuleOpts(settings.length);
        modulePickersContainer.append(newModulePicker);
      });
      const settingsDialog = emmet<"dialog">`
          dialog#smk-settings
            >h3{Nav: Vakkenknop vervangen}
            +h4{Voeg modules toe in de bovenbalk:}
            +${modulePickersContainer}
            +${addModuleBtn}
            +div.smscButtonContainer[style="margin-top:1em;"]
              >${saveSettingsBtn}
          `;
      document.body.append(settingsDialog);

      settingsDialog.showModal();
    });
  },
});

registerPlugin(plugin);
