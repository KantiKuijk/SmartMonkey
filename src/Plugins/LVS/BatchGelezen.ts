import { PluginMain, registerPlugin } from "../../Core/Plugins.js";
import { emmet } from "../../Core/emmet.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

const id = "lvs-batch-gelezen" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: true,
  info: {
    name: "LVS: Batch gelezen",
    description: "Markeer meerdere LVS-lijnen tegelijk als gelezen.",
    author: "Kanti Kuijk",
  },
  activate: async function () {
    if (!window.location.search.includes("?module=LVS")) return;
    const startpage = document.querySelector<HTMLDivElement>(
      "div#startpage_start",
    );
    if (!startpage) return;
    const LVSsections = await new Promise<NodeListOf<HTMLFieldSetElement>>(
      (resolve) => {
        const observer = new MutationObserver(() => {
          const LVSsections =
            startpage?.querySelectorAll<HTMLFieldSetElement>("fieldset");
          if (LVSsections.length > 0) {
            observer.disconnect();
            resolve(LVSsections);
          }
        });
        observer.observe(startpage, { childList: true, subtree: true });
      },
    );
    const dossierlijnenFS = Array.from(LVSsections).find((fs) =>
      fs
        .querySelector("legend")
        ?.textContent?.trim()
        .toLowerCase()
        .startsWith("dossierlijnen"),
    );
    if (!dossierlijnenFS) return;
    const actionButtonsWrapper = dossierlijnenFS.querySelector<HTMLDivElement>(
      "div.fsSearchResult_buttons_wrapper",
    );
    if (!actionButtonsWrapper) return;
    const batchGelezenBtn = emmet<"button">`button.fsSearchResult_button.batch[popovertarget=smk-lvs-batch-gelezen-dialog]`;
    batchGelezenBtn.style.backgroundImage =
      "url(https://static6.smart-school.net/smsc/svg/sparkles/sparkles_24x24.svg)";
    batchGelezenBtn.style.backgroundColor = "unset";
    batchGelezenBtn.style.border = "unset";
    batchGelezenBtn.addEventListener("click", async () => {});
    actionButtonsWrapper.appendChild(batchGelezenBtn);

    const bgdSubmitBtn = emmet<"button">`button.smscButton.yellow#smk-lvs-batch-gelezen-dialog-submit{Voer uit}`;
    const bgdValueField = emmet<"input">`input#smk-lvs-batch-gelezen-dialog-filter-value.smk-input[type=text][minlength=3][required]`;
    const bgdMatchField = emmet<"select">`select#smk-lvs-batch-gelezen-dialog-filter-match.smk-select
      >option[value=exact]{gelijk is aan}
      +option[value=contains]{bevat is in}`;
    const bgdFieldField = emmet<"select">`select#smk-lvs-batch-gelezen-dialog-filter-field.smk-select
      >option[value=titel]{de titel}
      +option[value=type]{het type}
      +option[value=auteur]{de auteur}
      +option[value=inhoud]{de inhoud}`;
    const batchGelezenDialog = emmet<"dialog">`
          dialog#smk-lvs-batch-gelezen-dialog.smk-dialog[popover=auto]
          >button.smscButton.red#smk-lvs-batch-gelezen-dialog-close{Annuleer}[popovertarget=smk-lvs-batch-gelezen-dialog][popovertargetaction=hide]
          +h3{Batch gelezen}
          +p{Markeer lijnen gelezen als}
          +${bgdValueField}
          +${bgdMatchField}
          +${bgdFieldField}
          +div.smscButtonContainer[style="margin-top:1em;"]
            >${bgdSubmitBtn}`;
    document.body.append(batchGelezenDialog);
    bgdSubmitBtn.addEventListener("click", () => {
      if (!bgdValueField.reportValidity()) return;
      const filter = {
        exact: (value: string, comparison: string) => value === comparison,
        contains: (value: string, comparison: string) =>
          value.includes(comparison),
      }[bgdMatchField.value as "exact" | "contains"];
      const comparison = bgdValueField.value.trim().toLowerCase();
      const matching = Array.from(
        dossierlijnenFS.querySelectorAll<HTMLTableRowElement>(
          "tr.search_notes_itemrow",
        ),
      ).filter((tr) => {
        const veldWaarde = ((
          tr: HTMLTableRowElement,
          veld: "titel" | "type" | "auteur" | "inhoud",
        ) => {
          switch (veld) {
            case "titel":
              return tr.children[1]?.textContent || "";
            case "type":
              return tr.children[2]?.textContent || "";
            case "auteur":
              return (
                tr.children[3]?.querySelector("div.userDiv")?.textContent || ""
              );
            case "inhoud":
              return (
                tr.parentElement?.querySelector<HTMLDivElement>(
                  `div#${tr.id.replace("row", "details")}_content`,
                )?.children[2]?.children[1]?.textContent || ""
              );
          }
        })(tr, bgdFieldField.value as "titel" | "type" | "auteur" | "inhoud");
        return filter(veldWaarde.trim().toLowerCase(), comparison);
      });
      confirm(`Markeer ${matching.length} lijn(en) als gelezen?`) &&
        matching.forEach((tr) => {
          tr.querySelector<HTMLDivElement>(
            `div#${tr.id.replace("row", "check")}`,
          )?.click();
        });
      batchGelezenDialog.hidePopover();
    });
  },
});

registerPlugin(plugin);
