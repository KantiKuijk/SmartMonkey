import { PluginMain, registerPlugin } from "../../Core/Plugins.js";
import { emmet } from "../../Core/emmet.js";
import { waitForElement, waitForFrameDocument } from "../../Core/utilities.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

const id = "skore-csv-import" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.2",
  inUseDefault: true,
  info: {
    name: "Skore: CSV import",
    description: "Importeer CSV-bestanden of tekst in Skore.",
    author: "Kanti Kuijk",
  },
  activate: async function () {
    if (!window.location.pathname.startsWith("/SkoreGradebook")) return;
    const frame = await waitForElement<HTMLIFrameElement>(
      "iframe#skore_gb_frame",
    );
    if (!frame) return;
    const frameDoc = await waitForFrameDocument(frame);
    const grids = await waitForElement<HTMLDivElement>("div.gb_grids", {
      root: frameDoc.body,
    });
    if (!grids) return;
    const evaluaties: {
      id: string;
      elem?: HTMLElement;
      btn?: HTMLButtonElement;
    }[] = [];

    let activeCol: string;
    const sciCSVField = emmet<"textarea">`textarea#smk-skore-csv-import-dialog-filter-value.smk-input[required][rows=20][cols=50]`;
    const sciSubmitBtn = emmet<"button">`button.smscButton.blue#smk-skore-csv-import-dialog-submit{Importeer}`;
    const sciOverschrijfCheckbox = emmet<"input">`input#smk-skore-csv-import-dialog-overschrijf.smk-input[type=checkbox]`;
    const sciOverschrijfField = emmet<"(">`(${sciOverschrijfCheckbox}+label[for=smk-skore-csv-import-dialog-overschrijf]{Overschrijven})`;
    const skoreCsvImportDialog = emmet<"dialog">`
          dialog#smk-skore-csv-import-dialog.smk-dialog[popover=auto]
          >button.smscButton.red#smk-skore-csv-import-dialog-close{Annuleer}[popovertarget=smk-skore-csv-import-dialog][popovertargetaction=hide]
          +h3{Import CSV of tekst}
          +${sciCSVField}
          +(p>${sciOverschrijfField})
          +div.smscButtonContainer[style="margin-top:1em;"]
            >${sciSubmitBtn}`;

    sciSubmitBtn.addEventListener("click", async () => {
      const csvText = sciCSVField.value.trim();
      if (!csvText) return;
      const llnnDiv = frameDoc.querySelector<HTMLDivElement>("div.pupil_space");
      if (!llnnDiv) return;
      const llnn: {
        id: string;
        klasnummer: string;
        achternaam: string;
        voornaam: string;
        naam: string;
      }[] = [];
      if (!llnnDiv) return;
      llnnDiv
        .querySelectorAll('div.cell[col="0"][row^="pupil_"]')
        .forEach((div) => {
          const row = div.getAttribute("row");
          if (!row) return;
          const [klasnummer, achternaam, voornaam] = div.textContent
            .trim()
            .split(/[.,] +/) as [string, string, string];
          const id = row.replace("pupil_", "");
          llnn.push({
            id,
            klasnummer: klasnummer.match("[0-9]+")?.[0] ?? "",
            achternaam: achternaam.trim().toLowerCase(),
            voornaam: voornaam.trim().toLowerCase(),
            naam: `${voornaam} ${achternaam}`.trim().toLowerCase(),
          });
        });
      const overschrijf = sciOverschrijfCheckbox.checked;
      const CSV = csvText.split(/\r?\n/).map((row) => row.split(/[;\t]/));
      for (const row of CSV) {
        const leerlingNaam = row[0]?.trim().toLowerCase();
        const cijfer = row[row.length - 1]?.trim();
        if (!leerlingNaam || !cijfer) continue;
        const leerling = llnn.find((ll) => {
          const leerlingNummer = leerlingNaam.match("[0-9]+")?.[0];
          if (
            ll.klasnummer &&
            leerlingNummer &&
            ll.klasnummer === leerlingNummer
          )
            return true;
          if (!leerlingNaam) return false;
          if (ll.naam === leerlingNaam) return true;
          if (ll.voornaam === leerlingNaam) return true;
          if (ll.achternaam === leerlingNaam) return true;
          if (ll.naam.includes(leerlingNaam)) return true;
          return false;
        });
        if (!leerling) continue;
        const cell = frameDoc.querySelector<HTMLDivElement>(
          `.cell[col="${activeCol}"][row="pupil_${leerling.id}"]`,
        );
        if (!cell) continue;
        cell.dispatchEvent(new Event("mousedown", { bubbles: true }));
        const input = cell.querySelector<HTMLInputElement>("input");
        if (!input) continue;
        if (overschrijf || !input.value) {
          input.value = cijfer;
          input.dispatchEvent(new Event("mousedown", { bubbles: true }));
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      skoreCsvImportDialog.hidePopover();
    });
    document.body.append(skoreCsvImportDialog);
    const observer = new MutationObserver(() => {
      (
        frameDoc
          .querySelector<HTMLDivElement>("div.maxtable_container")
          ?.querySelectorAll<HTMLDivElement>("div.col.colClass") ?? []
      ).forEach((col) => {
        const id = col.children[0]?.getAttribute("col");
        if (!id) return;
        const topCell = frameDoc.querySelector<HTMLDivElement>(
          `div.cell[col="${id}"][row^=clavg]`,
        );
        if (!topCell) return;
        const column = topCell.parentElement;
        if (!column) return;
        const actionCell = emmet<"div">`div.cell`;
        actionCell.style.top = `${(column?.children.length ?? 0) * topCell.offsetHeight}px`;
        actionCell.style.width = topCell.style.width;
        actionCell.style.height = topCell.style.height;
        actionCell.style.border = "none";
        actionCell.style.textAlign = "center";
        if (evaluaties.find((c) => c.id === id && c.elem === column)) return;
        const btn = emmet<"button">`button.fsSearchResult_button.batch{import}`;
        btn.addEventListener("click", async () => {
          activeCol = id;
          skoreCsvImportDialog.showPopover();
        });
        evaluaties.push({ id, elem: column, btn });
        actionCell.appendChild(btn);
        column.appendChild(actionCell);
      });
    });
    observer.observe(grids, { childList: true, subtree: true });
  },
});

registerPlugin(plugin);
