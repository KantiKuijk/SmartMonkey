import { emmet } from "./emmet.js";
import { PluginMain, SMState } from "./PluginClasses.js";
import {
  MAINPLUGINS,
  PLUGINIDS,
  registerPlugin,
  USERPLUGINS,
} from "./SmartMonkeyCore.js";
import { addCSS } from "./utilities.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

const ALWAYSENABLEDPLUGINS = ["settings"];

const id = "settings" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.2",
  inUseDefault: true,
  info: {
    name: "Settings",
    description: "Voegt SmartMonkey toe bij de settings",
    author: "Kanti Kuijk",
  },
  activate: () => {
    const href =
      window.performance.getEntriesByType("navigation")[0]?.name ??
      window.location.href;
    if (/^https:\/\/[a-zA-Z]+\.smartschool\.be\/\?module=Profile$/.test(href)) {
      // debugger;
      // if child doesn't exist either, it will exit just as well on the next line
      const smscSettings =
        document.querySelector(".smscSettings")?.parentElement;
      if (!smscSettings) return;
      const existingSettingsLink = smscSettings.querySelector(
        ".smscAdminNav_body_link"
      );
      if (!existingSettingsLink) return;
      // I would thing a cloned Element is also an Element, could be wrong though
      const settingsLink = existingSettingsLink.cloneNode(true) as Element;
      // always has parent since its inception is based on a queryselector on an alement
      {
        const title = settingsLink.querySelector(
          ".smscAdminNav_body_linkdivTitle"
        );
        if (title) {
          title.textContent = "SmartMonkey";
          const description = title.nextElementSibling;
          if (description) {
            description.textContent =
              "Verander de instellingen van SmartMonkey.";
          }
        }
        const image = settingsLink.querySelector(
          "div.smscAdminNav_body_linkdivIcon"
        ) as HTMLDivElement;
        if (image) {
          image.style.backgroundImage =
            "url('https://raw.githubusercontent.com/KantiKuijk/SmartMonkey/refs/heads/main/img/smk_gradient_512.png')";
        }
        const aTag = settingsLink.querySelector("a");
        if (!aTag) return;
        aTag.href = "";
        aTag.onclick = (e) => {
          e.preventDefault();
          addCSS(`
            #smk-settings {
              border: 1px solid #868686;
              border-radius:5px;
              overflow: visible;
              min-width: 25em;
            }
            #smk-settings h3:first-of-type {margin-top:0;}
            #smk-settings h4 {margin-top:1em;margin-bottom:0.5em;}
            #smk-settings .smscButton {min-width: initial;}
            #smk-settings #smk-settings-reset {float: right;}
            #smk-settings .smscCheckbox {display: block;}
            #smk-settings .smscCheckbox label.hasTooltip span.after {
              display: inline-block;
              border: .5px solid #868686;
              border-radius: 100%;
              width: 1em;
              height: 1em;
              margin: 0 0.25em;
              vertical-align: top;
              text-align: center;
              line-height: 1em;
            }
            #smk-settings .smscCheckbox label.hasTooltip span.tooltip {
              position: absolute;
              margin-left: 1.5em;
              padding-inline: 0.25em;
              width: max-content;
              border: 1px solid #868686;
              background: white;
              text-align: center;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.25s;
            }
            #smk-settings .smscCheckbox label.hasTooltip:has(.after:hover) span.tooltip {
              opacity: 1;
              transition: opacity 0.25s;
            }
            #smk-settings .smkButtonSmall {
              display: inline-block;
              border: .5px solid #868686;
              background: #fcfcfc;
              border-radius: 4px;
              margin: 0 0.25em;
              vertical-align: top;
              text-align: center;
              line-height: 1em;
            }
            #smk-settings .smkButtonSmall:hover {
              background: white;
              color: #868686;
            }
            #smk-settings .smkButtonSmall:active {
              border: .5px solid #ececec;
            }
            #smk-settings .smkButtonSmall:disabled {
              border: .5px solid #ececec;
              color: #ececec;
              background: unset;
            }
          `);
          const resetSettingsBtn = emmet<"button">`
          button.smscButton.red#smk-settings-reset
            {Reset}
          `;
          resetSettingsBtn.addEventListener("click", () => {
            // reload the page to reset the settings
            SMState.reset();
            window.location.reload();
          });
          // const annuleerSettingsBtn = emmet<"button">`
          // button.smscButton
          //   {Annuleer}
          // `;
          // annuleerSettingsBtn.addEventListener("click", () => {
          //   // reload the page to reset the settings
          //   window.location.reload();
          // });
          const saveSettingsBtn = emmet<"button">`
          button.smscButton.blue{Sluiten}
          `;
          saveSettingsBtn.addEventListener("click", () => {
            window.location.reload();
          });
          const settingsDialog = emmet<"dialog">`
          dialog#smk-settings
            >${resetSettingsBtn}
            +h3{SmartMonkey Instellingen}
            +h4{Welke plugins wil je gebruiken?}
            +${(() => {
              const fragment = document.createDocumentFragment();
              PLUGINIDS.filter(
                (pid) => !ALWAYSENABLEDPLUGINS.includes(pid)
              ).forEach((pid) => {
                const main = MAINPLUGINS[pid];
                const user = USERPLUGINS[pid];
                const inputId = `smk-plugin-enable-${pid}`;
                let plugSettingsBtn = emmet<"button">`
                button{…}.smkButtonSmall
                `;
                const { changeSettings } = main;
                if (changeSettings) {
                  plugSettingsBtn.addEventListener("click", async () => {
                    const newPlugSettings = await changeSettings();
                    SMState.changePluginState(pid, {
                      settings: newPlugSettings,
                    });
                  });
                } else plugSettingsBtn.disabled = true;
                const cbDiv = emmet<"div">`
                div.smscCheckbox
                  >${plugSettingsBtn}
                  +input[type=checkbox]#${inputId}${
                  user.inUse ? "[checked]" : ""
                }
                  +(label{${main.info.name}}[for=${inputId}].hasTooltip
                    >span.tooltip{${main.info.description}}
                    +span.after{?}
                  )`;
                const inUseCB = cbDiv.querySelector("input");
                inUseCB?.addEventListener("change", () => {
                  SMState.changePluginState(pid, { inUse: inUseCB.checked });
                });
                fragment.appendChild(cbDiv);
              });
              return fragment.querySelectorAll("div");
            })()}
            +div.smscButtonContainer[style="margin-top:1em;"]
              >${saveSettingsBtn}
          `;
          document.body.append(settingsDialog);

          settingsDialog.showModal();
        };
      }
      existingSettingsLink.parentElement?.append(settingsLink);
    }
  },
});

registerPlugin(plugin);
