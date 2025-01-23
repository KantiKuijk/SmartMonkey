import { SMState } from "./PluginClasses.js";

export type SMPluginInfo = {
  name: string;
  description: string;
  author: string;
};

export const VERSION = "v0.2b";

// @ts-expect-error object gets populated when every plugin registers itself
// it is up to the plugin to make sure it is both registered and namespaced
export const MAINPLUGINS: {
  [pluginId in SmartMonkey.PluginId]: SmartMonkey.MainPlugins[pluginId];
} = {};
export const PLUGINIDS: SmartMonkey.PluginId[] = [];
// @ts-expect-error object gets populated during main()
export const USERPLUGINS: SmartMonkey.UserPlugins = {};

export function registerPlugin(plugin: SmartMonkey.MainPlugin) {
  // @ts-expect-error ts can't couple the id to the plugin on a type-level
  MAINPLUGINS[plugin.id] = plugin;
  PLUGINIDS.push(plugin.id);
}

function isPluginId(id: string): id is SmartMonkey.PluginId {
  // the irony of the as statement isn't lost on me
  return PLUGINIDS.includes(id as SmartMonkey.PluginId);
}

export async function main() {
  SMState.init();
  const activatedPluginNames = PLUGINIDS.map((pluginId) => {
    if (!isPluginId(pluginId)) return;
    const pluginMain = MAINPLUGINS[pluginId];
    if (!pluginMain) throw new Error(`Plugin ${pluginId} is not registered.`);
    const pluginUser = pluginMain.spawn();
    // @ts-expect-error ts can't couple the id to the plugin on a type-level
    USERPLUGINS[pluginId] = pluginUser;
    return pluginMain.info.name;
  }).filter((e) => e);
  console.info(
    `SmartMonkey activating plugins: ${activatedPluginNames.join(", ")}`
  );
}
