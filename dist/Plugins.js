import { SMState } from "./Helpers.js";
import { MAINPLUGINS, PLUGINIDS } from "./PluginRegistries.js";
export function registerPlugin(plugin) {
    // @ts-expect-error ts can't couple the id to the plugin on a type-level
    MAINPLUGINS[plugin.id] = plugin;
    PLUGINIDS.push(plugin.id);
}
export function isPluginId(id) {
    // the irony of the as statement isn't lost on me
    return PLUGINIDS.includes(id);
}
export class PluginMain {
    id;
    version;
    info;
    inUseDefault;
    settingsDefault;
    activated = false;
    activator;
    changeSettings;
    user;
    constructor({ id, version, info, inUseDefault, settingsDefault, activate: activator, changeSettings, }) {
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
    get stateDefault() {
        return {
            version: this.version,
            inUse: this.inUseDefault,
            settings: this.settingsDefault,
        };
    }
    spawn() {
        if (this.activated)
            throw new Error(`Plugin ${this.id} was already activated.`);
        const storedState = SMState.plugins[this.id];
        // this line makes the state more resistive against missing values in storage
        // but won't fix those values in storage if they are missing
        const state = { ...this.stateDefault, ...storedState };
        if (state.version !== this.version) {
            console.log(`SMK: Plugin ${this.id} was activated with version ${state.version}, but it is version ${this.version}.`);
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
export class PluginUser {
    id;
    version;
    _inUse;
    settings;
    main;
    constructor({ id, version, inUse, settings, main, }) {
        this.id = id;
        this.version = version;
        this._inUse = inUse;
        // extra precaution for missing settings because zod doesn't validate settings
        this.settings = settings ?? main.settingsDefault;
        this.main = main;
    }
    get state() {
        return {
            version: this.version,
            inUse: this.inUse,
            settings: this.settings,
        };
    }
    set inUse(inUse) {
        this._inUse = inUse;
        SMState.changePluginState(this.id, {
            version: this.version,
            inUse,
            settings: this.settings,
        });
    }
    get inUse() {
        return this._inUse;
    }
}
//# sourceMappingURL=Plugins.js.map