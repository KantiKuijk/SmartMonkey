import "../Plugins/Settings.js";
import "../Plugins/UI/NavknoppenToevoegen.js";
import "../Plugins/UI/NavknoppenAlsIcoontjes.js";
import "../Plugins/UI/VakkenknopVerwijderen.js";
import "../Plugins/Planner/PlannerGeenBlokletters.js";
import "../Plugins/Planner/PlannerWeekendVolgendeWeek.js";
import "../Plugins/Planner/PlannerVerduidelijkOpdrachttype.js";
import "../Plugins/Planner/TodoIcoontjes.js";
import "../Plugins/Planner/TodoStandaardDuurtijd.js";
import "../Plugins/Hotkeys.js";
import { SMState } from "./Helpers.js";
import { isPluginId } from "./Plugins.js";
import { MAINPLUGINS, PLUGINIDS, USERPLUGINS } from "./PluginRegistries.js";
(() => {
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
    `SmartMonkey activating plugins: ${activatedPluginNames.join(", ")}`,
  );
})();
