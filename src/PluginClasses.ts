import { z } from "zod";
import {
  MAINPLUGINS,
  PLUGINIDS,
  USERPLUGINS,
  VERSION,
  type SMPluginInfo,
} from "./SmartMonkeyCore.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {}
    interface PluginsSettings {}
    type PluginId = keyof MainPlugins;
    type PluginWithSettingsId = keyof PluginsSettings;
    type SettingsOfPlugin<PID extends PluginId> =
      PID extends PluginWithSettingsId ? PluginsSettings[PID] : undefined;
    type UserPlugins = {
      [pid in PluginId]: PluginUser<pid>;
    };
    // type PluginsSettings = {
    //   [pid in PluginIds]: MainPlugins[pid] extends PluginMain<pid, infer S>
    //     ? S
    //     : never;
    // };
    type MainPlugin = MainPlugins[PluginId];
    type UserPlugin = UserPlugins[PluginId];
  }
}

export class PluginMain<Id extends SmartMonkey.PluginId> {
  public id: Id;
  public version: string;
  public info: SMPluginInfo;
  public inUseDefault: boolean;
  public settingsDefault: NoInfer<SmartMonkey.SettingsOfPlugin<Id>>;
  private activated = false;
  private activator: NoInfer<
    (settings: SmartMonkey.SettingsOfPlugin<Id>) => void
  >;
  public changeSettings?: NoInfer<
    () => Promise<SmartMonkey.SettingsOfPlugin<Id>>
  >;
  public user: NoInfer<PluginUser<Id>>;

  constructor(params: {
    id: SmartMonkey.PluginWithSettingsId;
    version: string;
    info: SMPluginInfo;
    inUseDefault: boolean;
    settingsDefault: NoInfer<SmartMonkey.SettingsOfPlugin<Id>>;
    activate: NoInfer<
      (this: PluginMain<Id>, settings: SmartMonkey.SettingsOfPlugin<Id>) => void
    >;
    changeSettings: NoInfer<
      (this: PluginMain<Id>) => Promise<SmartMonkey.SettingsOfPlugin<Id>>
    >;
  });
  constructor(params: {
    id: Exclude<SmartMonkey.PluginId, SmartMonkey.PluginWithSettingsId>;
    version: string;
    info: SMPluginInfo;
    inUseDefault: boolean;
    activate: NoInfer<
      (this: PluginMain<Id>, settings: SmartMonkey.SettingsOfPlugin<Id>) => void
    >;
  });
  constructor({
    id,
    version,
    info,
    inUseDefault,
    settingsDefault,
    activate: activator,
    changeSettings,
  }: {
    id: Id;
    version: string;
    info: SMPluginInfo;
    inUseDefault: boolean;
    settingsDefault: NoInfer<SmartMonkey.SettingsOfPlugin<Id>>;
    activate: NoInfer<
      (this: PluginMain<Id>, settings: SmartMonkey.SettingsOfPlugin<Id>) => void
    >;
    changeSettings?: NoInfer<
      (this: PluginMain<Id>) => Promise<SmartMonkey.SettingsOfPlugin<Id>>
    >;
  }) {
    this.id = id;
    this.version = version;
    this.info = info;
    this.inUseDefault = inUseDefault;
    this.activator = activator.bind(this);
    this.settingsDefault = settingsDefault;
    this.changeSettings = changeSettings?.bind(this);
    this.user = new PluginUser({
      id: this.id,
      version: this.version,
      inUse: this.inUseDefault,
      settings: this.settingsDefault,
      main: this,
    });
  }

  public get stateDefault() {
    return {
      version: this.version,
      inUse: this.inUseDefault,
      settings: this.settingsDefault,
    };
  }

  public spawn(): NoInfer<PluginUser<Id> | undefined> {
    if (this.activated)
      throw new Error(`Plugin ${this.id} was already activated.`);
    const storedState = SMState.plugins[this.id];
    // this line makes the state more resistive against missing values in storage
    // but won't fix those values in storage if they are missing
    const state = { ...this.stateDefault, ...storedState };
    if (state.version !== this.version) {
      console.log(
        `SMK: Plugin ${this.id} was activated with version ${state.version}, but it is version ${this.version}.`
      );
      SMState.changePluginState(this.id, {
        version: this.version,
      });
      // Do something with the version difference if ever implemented
    }
    const pluginUser = new PluginUser({
      id: this.id,
      ...state,
      main: this,
    });
    this.user = pluginUser;
    if (state.inUse) {
      this.activator(state.settings);
    }
    this.activated = true;
    return pluginUser;
  }
}

type SMStateObj = {
  version: string;
  plugins: {
    [pid in SmartMonkey.PluginId]?: {
      version: string;
      inUse: boolean;
      settings: SmartMonkey.SettingsOfPlugin<pid>;
    };
  };
};

export class SMState {
  public static storagekey = "smartmonkey";
  public static state: SMStateObj;
  public static zod = () => {
    // debugger;
    console.log("PLUGINS", PLUGINIDS);
    return z.object({
      version: z.string().min(2),
      plugins: z.record(
        // the array containing all the plugin ids is just an array of strings
        z.enum(PLUGINIDS as [string, ...string[]]),
        z
          .object({
            version: z.string().min(2),
            inUse: z.boolean(),
            settings: z.unknown().optional(),
          })
          .optional()
      ),
    });
  };
  public static version: string;
  public static plugins: SMStateObj["plugins"];

  public static init(state?: SMStateObj) {
    const newState = state ?? SMState.getFromStorage();
    SMState.state = newState;
    SMState.version = newState.version;
    SMState.plugins = newState.plugins;
  }

  public static getFromStorage() {
    try {
      console.log("getting from storage");
      const storedState = localStorage.getItem(SMState.storagekey);
      console.log("stored");
      console.log(storedState);
      if (!storedState) return SMState.empty();
      const state = JSON.parse(storedState);
      console.log("getting state", state);
      const stateParsed = SMState.zod().parse(state) as SMStateObj;
      return stateParsed;
    } catch (e) {
      console.error(e);
      window.alert(
        "SmartMonkey heeft een fout nootje gegeten en zal zichzelf resetten."
      );
      const state = SMState.empty();
      return state;
    }
  }

  public static empty(): SMStateObj {
    this.init({
      version: VERSION,
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
        })
      ),
    });
    this.save();
    return this.state;
  }

  protected static save() {
    console.log("saving to", SMState.state);
    localStorage.setItem(SMState.storagekey, JSON.stringify(SMState.state));
  }
  public static overwrite(state: SMStateObj) {
    // overwrite the state, only use this as an exception, prefer changePluginState
    console.log("overwriting", state);
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

  public static getPluginState(pid: SmartMonkey.PluginId) {
    return SMState.plugins[pid];
  }
  public static changePluginState<PID extends SmartMonkey.PluginId>(
    pid: PID,
    state: Partial<Exclude<SMStateObj["plugins"][PID], undefined>>
  ) {
    SMState.plugins[pid] = {
      ...(USERPLUGINS[pid]?.state ?? {}),
      ...SMState.plugins[pid],
      ...state,
    };
    SMState.save();
  }
}

export class PluginUser<Id extends SmartMonkey.PluginId> {
  public id: Id;
  public version: string;
  private _inUse: boolean;
  public settings: SmartMonkey.SettingsOfPlugin<Id>;
  public main: PluginMain<Id>;

  constructor({
    id,
    version,
    inUse,
    settings,
    main,
  }: {
    id: Id;
    version: string;
    inUse: boolean;
    settings: SmartMonkey.SettingsOfPlugin<Id>;
    main: PluginMain<Id>;
  }) {
    this.id = id;
    this.version = version;
    this._inUse = inUse;
    // extra precaution for missing settings because zod doesn't validate settings
    this.settings = settings ?? main.settingsDefault;
    this.main = main;
  }

  public get state() {
    return {
      version: this.version,
      inUse: this.inUse,
      settings: this.settings,
    };
  }

  public set inUse(inUse: boolean) {
    this._inUse = inUse;
    SMState.changePluginState(this.id, {
      version: this.version,
      inUse,
      settings: this.settings,
    });
  }
  public get inUse() {
    return this._inUse;
  }
}
