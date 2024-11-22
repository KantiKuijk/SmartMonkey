import { z } from "zod";

type SMPluginID = string;

type SMPluginInfo = {
  name: string;
  description: string;
  version: string;
  author: string;
};

export type SMPlugin = {
  id: SMPluginID;
  info: SMPluginInfo;
  inUse: boolean;
  init?: () => void;
  activate: () => void;
  deactivate?: () => void;
};

const SMStateZod = z.object({
  plugins: z.record(
    z
      .object({
        inUse: z.boolean(),
      })
      .strict()
  ),
});
type SMState = z.infer<typeof SMStateZod>;
const SMSTORAGEKEY = "smartmonkey";

function getSMState(secondTry = false): SMState {
  try {
    const SMSfromStorage = localStorage.getItem(SMSTORAGEKEY);
    if (!SMSfromStorage) {
      const SMState = {
        plugins: {},
      } satisfies SMState;
      localStorage.setItem(SMSTORAGEKEY, JSON.stringify(SMState));
      return SMState;
    } else {
      const SMState = JSON.parse(SMSfromStorage);
      return SMStateZod.parse(SMState);
    }
  } catch (e) {
    if (secondTry) {
      console.error(e);
      window.alert("SmartMonkey is gestorven aan het nootje.");
      return {
        plugins: {},
      } satisfies SMState;
    } else {
      console.error(e);
      window.alert(
        "SmartMonkey heeft een fout nootje gegeten en zal zichzelf resetten."
      );
      localStorage.removeItem(SMSTORAGEKEY);
      return getSMState(true);
    }
  }
}

type SMPluginPreRegister = Omit<SMPlugin, "inUse">;
const REGISTERED_PLUGINS: Record<string, SMPluginPreRegister> = {};
export function registerPlugin(plugin: SMPluginPreRegister) {
  REGISTERED_PLUGINS[plugin.id] = plugin;
  const SMState = getSMState();
  if (!SMState.plugins[plugin.id]) {
    SMState.plugins[plugin.id] = {
      inUse: false,
    } satisfies SMState["plugins"][SMPluginID];
    localStorage.setItem(SMSTORAGEKEY, JSON.stringify(SMState));
  }
  if (plugin.init) return plugin.init();
}

export async function main() {
  const SMState = getSMState();
  for (const pluginID in SMState.plugins) {
    const pluginStatus = SMState.plugins[pluginID];
    if (!pluginStatus) continue;
    if (!pluginStatus.inUse) continue;
    const plugin = REGISTERED_PLUGINS[pluginID];
    if (!plugin) continue;
    await plugin.activate();
  }
}
