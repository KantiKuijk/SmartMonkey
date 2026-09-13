// @ts-expect-error object gets populated when every plugin registers itself
// it is up to the plugin to make sure it is both registered and namespaced
export const MAINPLUGINS: {
  [pluginId in SmartMonkey.PluginId]: SmartMonkey.MainPlugins[pluginId];
} = {};
export const PLUGINIDS: SmartMonkey.PluginId[] = [];

// @ts-expect-error object gets populated during main()
export const USERPLUGINS: SmartMonkey.UserPlugins = {};
