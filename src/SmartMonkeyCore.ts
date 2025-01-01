import { z } from "zod";

const SMStateZod = z.object({
  plugins: z.record(
    z
      .object({
        inUse: z.boolean(),
        id: z.string().min(6),
        info: z
          .object({
            name: z.string().min(6),
            description: z.string().min(16),
            version: z.string().min(2),
            author: z.string().min(3),
          })
          .strict(),
      })
      .strict()
  ),
});
type SMState = z.infer<typeof SMStateZod>;
export const SMSTORAGEKEY = "smartmonkey";

type SMPluginInfo = SMState["plugins"][string]["info"];

type SMPluginID = string;

export type SMPlugin = {
  id: SMPluginID;
  info: SMPluginInfo;
  inUse: boolean;
  init?: () => void;
  activate: () => void;
  deactivate?: () => void;
};

export function getSMState(secondTry = false): SMState {
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

function stringifyPluginOptions(info: SMPlugin["info"]) {
  // @ts-expect-error b - a is kind of dirty but well known to work for sorting
  const entries = Object.entries(info).sort(([a, _], [b, __]) => b - a);
  return JSON.stringify(entries);
}
type SMPluginPreRegister = Omit<SMPlugin, "inUse">;
const REGISTERED_PLUGINS: Record<string, SMPluginPreRegister> = {};
export function registerPlugin(plugin: SMPluginPreRegister) {
  REGISTERED_PLUGINS[plugin.id] = plugin;
  const SMState = getSMState();
  const storedPlugin = SMState.plugins[plugin.id];
  if (!storedPlugin) {
    SMState.plugins[plugin.id] = {
      inUse: true,
      id: plugin.id,
      info: plugin.info,
    } satisfies SMState["plugins"][SMPluginID];
    localStorage.setItem(SMSTORAGEKEY, JSON.stringify(SMState));
  } else if (
    stringifyPluginOptions(storedPlugin.info) !==
    stringifyPluginOptions(plugin.info)
  ) {
    storedPlugin.info = plugin.info;
    localStorage.setItem(SMSTORAGEKEY, JSON.stringify(SMState));
  }
  if (plugin.init) return plugin.init();
}

export async function main() {
  const SMState = getSMState();
  const activatedPluginNames = [];
  for (const pluginID in SMState.plugins) {
    const pluginStatus = SMState.plugins[pluginID];
    if (!pluginStatus) continue;
    if (!pluginStatus.inUse) continue;
    const plugin = REGISTERED_PLUGINS[pluginID];
    if (!plugin) continue;
    await plugin.activate();
    activatedPluginNames.push(plugin.info.name);
  }
  console.info(
    `SmartMonkey activated plugins: ${activatedPluginNames.join(", ")}`
  );
}
