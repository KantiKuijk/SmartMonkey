import { z } from "zod";
import {} from "./Plugins.js";
import { MAINPLUGINS, PLUGINIDS, USERPLUGINS } from "./PluginRegistries.js";
/*** SMState ***/
/*** User IDs ***/
const SMUserIDsZod = z.object({
    ssid: z.string().min(1),
    userid: z.string().min(1),
    userlt: z.string().min(1),
    idString: z.string().min(1),
});
export async function getUserIDs() {
    return new Promise((res, _rej) => {
        const localRead = SMState.getHelperState("userIDs");
        if (localRead) {
            res(localRead);
        }
        else {
            const localStorageKeys = Object.keys(localStorage);
            const anyUIDkeyRegex = /^.*[\/_-]([0-9]{4}_[0-9]{4}_[0-9]{0,1})$/;
            const anyUIDkey = localStorageKeys.filter((k) => anyUIDkeyRegex.test(k))[0];
            function resWithIdString(idString) {
                const [ssid, userid, userlt] = idString.split("_");
                const uids = { ssid, userid, userlt, idString };
                SMState.setHelperState("userIDs", uids);
                res(uids);
            }
            if (anyUIDkey)
                resWithIdString(anyUIDkey.replace(anyUIDkeyRegex, "$1"));
            else {
                const interval = setInterval(() => {
                    const href = window.location.href;
                    const fullRegex = /(https:\/\/[a-zA-Z]+\.smartschool\.be\/planner\/main\/user)\/([0-9_]+)\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/?/;
                    if (fullRegex.test(href)) {
                        clearTimeout(interval);
                        resWithIdString(href.replace(fullRegex, "$2"));
                    }
                }, 33);
            }
        }
    });
}
const modulesZod = z.array(z.object({
    id: z.string().min(1),
    display: z.string().min(1),
    href: z.string().min(1),
    type: z.enum(["smartschool", "link"]),
}));
export async function getModules(types = { smartschool: true }) {
    /* Gets all modules that are available to the user, filtered by type */
    const modules = SMState.getHelperState("modules");
    if (modules.length)
        return modules.filter((m) => types[m.type]);
    document
        .querySelector("#shortcutsMenu")
        ?.querySelectorAll(".shortcut-wrapper>a.topnav__menuitem")
        .forEach((link) => {
        const href = link?.getAttribute("href");
        const display = link?.textContent.trim();
        if (!href || !display)
            return;
        modules.push({
            type: "smartschool",
            id: `smsc-${display.toLowerCase().replace(/\s+/g, "-")}`,
            display,
            href,
        });
    });
    const linksMenu = document.querySelector("#linksMenu");
    if (linksMenu) {
        let linksMenuElements = linksMenu.querySelectorAll("a.topnav__menuitem");
        if (linksMenuElements.length === 0) {
            const linksMenuButton = document.querySelector("[data-links]>button.topnav__btn");
            if (linksMenuButton) {
                const linksMenuPromise = new Promise((resolve) => {
                    const observer = new MutationObserver(() => {
                        linksMenuElements =
                            linksMenu.querySelectorAll("a.topnav__menuitem");
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
                debugger;
            }
        }
        linksMenu
            .querySelectorAll("a.topnav__menuitem")
            .forEach((link) => {
            const href = link?.getAttribute("href");
            const display = link?.textContent.trim();
            if (!href || !display)
                return;
            modules.push({
                type: "link",
                id: `link-${display.toLowerCase().replace(/\s+/g, "-")}`,
                display,
                href,
            });
        });
    }
    SMState.setHelperState("modules", modules);
    return modules.filter((m) => types[m.type]);
}
/*** SMState ***/
export const SMHelperStateZod = z.object({
    userIDs: SMUserIDsZod.optional(),
    modules: modulesZod,
});
export class SMState {
    static storagekey = "smartmonkey";
    static state;
    static zod = () => {
        console.log("PLUGINS", PLUGINIDS);
        return z.object({
            version: z.string().min(2),
            helpers: SMHelperStateZod,
            plugins: z.record(
            // the array containing all the plugin ids is just an array of strings
            z.enum(PLUGINIDS), z
                .object({
                version: z.string().min(2),
                inUse: z.boolean(),
                settings: z.unknown().optional(),
            })
                .optional()),
        });
    };
    static version;
    static plugins;
    static helpers;
    static init(state) {
        const newState = state ?? SMState.getFromStorage();
        SMState.state = newState;
        SMState.version = newState.version;
        SMState.plugins = newState.plugins;
        SMState.helpers = newState.helpers;
    }
    static getFromStorage() {
        try {
            const storedState = localStorage.getItem(SMState.storagekey);
            if (!storedState)
                return SMState.empty();
            const state = JSON.parse(storedState);
            const stateParsed = SMState.zod().parse(state);
            return stateParsed;
        }
        catch (e) {
            console.error(e);
            window.alert("SmartMonkey heeft een fout nootje gegeten en zal zichzelf resetten.");
            const state = SMState.empty();
            return state;
        }
    }
    static makeEmptyState() {
        return {
            version: VERSION,
            helpers: {
                modules: [],
            },
            plugins: Object.fromEntries(PLUGINIDS.map((pid) => {
                const main = MAINPLUGINS[pid];
                return [
                    pid,
                    {
                        version: main.version,
                        inUse: main.inUseDefault,
                        settings: main.settingsDefault,
                    },
                ];
            })),
        };
    }
    static empty() {
        this.init(this.makeEmptyState());
        this.save();
        return this.state;
    }
    static save() {
        console.log("saving to", SMState.state);
        localStorage.setItem(SMState.storagekey, JSON.stringify(SMState.state));
    }
    static overwrite(state) {
        // overwrite the state, only use this as an exception, prefer changePluginState
        console.log("overwriting", state);
        const parsed = SMState.zod().safeParse(state);
        if (!parsed.success) {
            console.error(parsed.error);
            return false;
        }
        else {
            SMState.state = parsed.data;
            SMState.save();
            return true;
        }
    }
    static reset() {
        SMState.state = SMState.empty();
        SMState.save();
    }
    static getSubState(key) {
        return SMState.state[key];
    }
    static getHelperState(helper) {
        return this.getSubState("helpers")[helper];
    }
    static setHelperState(helper, state) {
        SMState.helpers[helper] = state;
        SMState.save();
    }
    static getPluginState(pid) {
        return this.getSubState("plugins")[pid];
    }
    static changePluginState(pid, state) {
        SMState.plugins[pid] = {
            ...(USERPLUGINS[pid]?.state ?? {}),
            ...SMState.plugins[pid],
            ...state,
        };
        SMState.save();
    }
}
export const VERSION = "v0.2b";
//# sourceMappingURL=Helpers.js.map