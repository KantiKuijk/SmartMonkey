import { registerPlugin } from "./SmartMonkeyCore.js";
import { getUserIDs } from "./SmartMonkeyHelpers.js";

registerPlugin({
  id: "planner-weekend-volgende-week",
  info: {
    name: "Planner: Toon komende week",
    description:
      "Zorgt dat tijdens het weekend de planner standaard gaat naar de week die komt i.p.v. de afgelopen week.",
    version: "v0.1",
    author: "Kanti Kuijk",
  },
  activate: async () => {
    const href =
      window.performance.getEntriesByType("navigation")[0]?.name ??
      window.location.href;
    const date = new Date();
    const day = date.getDay();
    if (
      /^https:\/\/[a-zA-Z]+\.smartschool\.be\/planner\/?$/.test(href) &&
      (day === 6 || day === 0)
    ) {
      const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      const [year, month, day] = [
        nextWeek.getFullYear(),
        nextWeek.getMonth() + 1,
        nextWeek.getDate(),
      ].map((n) => n.toString().padStart(2, "0"));
      const newHref = `${href}/main/user/${
        (await getUserIDs()).idString
      }/${year}-${month}-${day}`;
      window.location.href = newHref;
    }
  },
});
