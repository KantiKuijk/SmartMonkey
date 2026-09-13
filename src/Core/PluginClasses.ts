import { SMState } from "./Helpers.js";

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
        `SMK: Plugin ${this.id} was activated with version ${state.version}, but it is version ${this.version}.`,
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

export type SMPluginState<PID extends SmartMonkey.PluginId> = {
  version: string;
  inUse: boolean;
  settings: SmartMonkey.SettingsOfPlugin<PID>;
};
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
export type SMPluginInfo = {
  name: string;
  description: string;
  author: string;
};
