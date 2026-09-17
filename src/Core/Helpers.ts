import { z } from "zod";
import { type SMPluginState } from "./Plugins.js";
import { MAINPLUGINS, PLUGINIDS, USERPLUGINS } from "./PluginRegistries.js";

/*** SMState ***/

/*** User IDs ***/
const SMUserIDsZod = z.object({
  ssid: z.string().min(1),
  userid: z.string().min(1),
  userlt: z.string().min(1),
  idString: z.string().min(1),
});
type SMUserIDs = z.infer<typeof SMUserIDsZod>;

export async function getUserIDs() {
  return new Promise<SMUserIDs>((res, _rej) => {
    const localRead = SMState.getHelperState("userIDs");
    if (localRead) {
      res(localRead);
    } else {
      const localStorageKeys = Object.keys(localStorage);
      const anyUIDkeyRegex = /^.*[\/_-]([0-9]{4}_[0-9]{4}_[0-9]{0,1})$/;
      const anyUIDkey = localStorageKeys.filter((k) =>
        anyUIDkeyRegex.test(k),
      )[0];
      function resWithIdString(idString: string) {
        const [ssid, userid, userlt] = idString.split("_") as [
          string,
          string,
          string,
        ];
        const uids = { ssid, userid, userlt, idString };
        SMState.setHelperState("userIDs", uids);
        res(uids);
      }
      if (anyUIDkey) resWithIdString(anyUIDkey.replace(anyUIDkeyRegex, "$1"));
      else {
        const interval = setInterval(() => {
          const href = window.location.href;
          const fullRegex =
            /(https:\/\/[a-zA-Z]+\.smartschool\.be\/planner\/main\/user)\/([0-9_]+)\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/?/;
          if (fullRegex.test(href)) {
            clearTimeout(interval);
            resWithIdString(href.replace(fullRegex, "$2"));
          }
        }, 33);
      }
    }
  });
}

export type ModuleType = "smartschool" | "link";
const modulesZod = z.array(
  z.object({
    id: z.string().min(1),
    display: z.string().min(1),
    href: z.string().min(1),
    target: z.string().min(1).optional(),
    type: z.enum(["smartschool", "link"]),
  }),
);
export type Module = z.infer<typeof modulesZod>;
export async function getModules(
  types: { [T in ModuleType]?: boolean } = { smartschool: true },
) {
  /* Gets all modules that are available to the user, filtered by type */
  const modules = SMState.getHelperState("modules");
  if (modules.length && !force) return modules.filter((m) => types[m.type]);
  document
    .querySelector("#shortcutsMenu")
    ?.querySelectorAll<HTMLAnchorElement>(
      ".shortcut-wrapper>a.topnav__menuitem",
    )
    .forEach((link) => {
      const href = link?.getAttribute("href");
      const display = link?.textContent.trim();
      if (!href || !display) return;
      modules.push({
        type: "smartschool",
        id: `smsc-${display.toLowerCase().replace(/\s+/g, "-")}`,
        display,
        href,
        target: link?.getAttribute("target") || undefined,
      });
    });
  const linksMenu = document.querySelector("#linksMenu");
  if (linksMenu) {
    let linksMenuElements =
      linksMenu.querySelectorAll<HTMLAnchorElement>("a.topnav__menuitem");
    if (linksMenuElements.length === 0) {
      const linksMenuButton = document.querySelector<HTMLButtonElement>(
        "[data-links]>button.topnav__btn",
      );
      if (linksMenuButton) {
        const linksMenuPromise = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            linksMenuElements =
              linksMenu.querySelectorAll<HTMLAnchorElement>(
                "a.topnav__menuitem",
              );
            if (linksMenuElements.length > 0) {
              observer.disconnect();
              resolve();
            }
          });
          observer.observe(linksMenu, { childList: true, subtree: true });
        });
        linksMenuButton.dispatchEvent(new MouseEvent("mouseup"));
        linksMenuButton.dispatchEvent(new MouseEvent("mouseup"));
        await linksMenuPromise;
      }
    }
    linksMenu
      .querySelectorAll<HTMLAnchorElement>("a.topnav__menuitem")
      .forEach((link) => {
        const href = link?.getAttribute("href");
        const display = link?.textContent.trim();
        if (!href || !display) return;
        modules.push({
          type: "link",
          id: `link-${display.toLowerCase().replace(/\s+/g, "-")}`,
          display,
          href,
          target: link?.getAttribute("target") || undefined,
        });
      });
  }
  const uniqueModules = modules
    .reverse()
    .filter((m, i, arr) => arr.findIndex((m2) => m2.id === m.id) === i)
    .reverse();
  SMState.setHelperState("modules", uniqueModules);
  return uniqueModules.filter((m) => types[m.type]);
}

/*** SMState ***/
export const SMHelperStateZod = z.object({
  userIDs: SMUserIDsZod.optional(),
  modules: modulesZod,
});

export type SMHelpersState = z.infer<typeof SMHelperStateZod>;
export type SMStateObj = {
  version: string;
  helpers: SMHelpersState;
  plugins: {
    [pid in SmartMonkey.PluginId]?: SMPluginState<pid>;
  };
};
export class SMState {
  public static storagekey = "smartmonkey";
  public static state: SMStateObj;
  public static zod = () => {
    console.log("PLUGINS", PLUGINIDS);
    return z.object({
      version: z.string().min(2),
      helpers: SMHelperStateZod,
      plugins: z.record(
        // the array containing all the plugin ids is just an array of strings
        z.enum(PLUGINIDS as [string, ...string[]]),
        z
          .object({
            version: z.string().min(2),
            inUse: z.boolean(),
            settings: z.unknown().optional(),
          })
          .optional(),
      ),
    });
  };
  public static version: string;
  public static plugins: SMStateObj["plugins"];
  public static helpers: SMStateObj["helpers"];

  public static init(state?: SMStateObj) {
    const newState = state ?? SMState.getFromStorage();
    SMState.state = newState;
    SMState.version = newState.version;
    SMState.plugins = newState.plugins;
    SMState.helpers = newState.helpers;
  }

  public static getFromStorage() {
    try {
      const storedState = localStorage.getItem(SMState.storagekey);
      if (!storedState) return SMState.empty();
      const state = JSON.parse(storedState);
      const stateParsed = SMState.zod().parse(state) as SMStateObj;
      return stateParsed;
    } catch (e) {
      console.error(e);
      window.alert(
        "SmartMonkey heeft een fout nootje gegeten en zal zichzelf resetten.",
      );
      const state = SMState.empty();
      return state;
    }
  }
  private static makeEmptyState(): SMStateObj {
    return {
      version: VERSION,
      helpers: {
        modules: [],
      },
      plugins: Object.fromEntries(
        PLUGINIDS.map((pid) => {
          const main = MAINPLUGINS[pid];
          return [
            pid,
            {
              version: main.version,
              inUse: main.inUseDefault,
              settings: main.settingsDefault,
            },
          ];
        }),
      ),
    };
  }
  public static empty(): SMStateObj {
    this.init(this.makeEmptyState());
    this.save();
    return this.state;
  }

  protected static save() {
    localStorage.setItem(SMState.storagekey, JSON.stringify(SMState.state));
  }
  public static overwrite(state: SMStateObj) {
    // overwrite the state, only use this as an exception, prefer changePluginState
    const parsed = SMState.zod().safeParse(state);
    if (!parsed.success) {
      console.error(parsed.error);
      return false;
    } else {
      SMState.state = parsed.data;
      SMState.save();
      return true;
    }
  }

  public static reset() {
    SMState.state = SMState.empty();
    SMState.save();
  }

  private static getSubState<T extends keyof SMStateObj>(
    key: T,
  ): SMStateObj[T] {
    return SMState.state[key];
  }

  public static getHelperState<HID extends keyof SMHelpersState>(helper: HID) {
    return this.getSubState("helpers")[helper];
  }
  public static setHelperState<HID extends keyof SMHelpersState>(
    helper: HID,
    state: Exclude<SMHelpersState[HID], undefined>,
  ) {
    SMState.helpers[helper] = state;
    SMState.save();
  }

  public static getPluginState(pid: SmartMonkey.PluginId) {
    return this.getSubState("plugins")[pid];
  }

  public static changePluginState<PID extends SmartMonkey.PluginId>(
    pid: PID,
    state: Partial<SMPluginState<PID>>,
  ) {
    SMState.plugins[pid] = {
      ...(USERPLUGINS[pid]?.state ?? {}),
      ...SMState.plugins[pid],
      ...state,
    };
    SMState.save();
  }
}
export const VERSION = "v0.2b";
