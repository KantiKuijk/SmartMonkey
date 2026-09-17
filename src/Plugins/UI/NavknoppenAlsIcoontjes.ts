import { PluginMain, registerPlugin } from "../../Core/Plugins.js";
import { getModules } from "../../Core/Helpers.js";

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
  }
}

function setIconForNavbarButton(
  btn: HTMLAnchorElement | HTMLButtonElement,
  icon: string,
) {
  btn.childNodes.forEach((child) => {
    if (child instanceof Text) {
      child.textContent = "";
    }
  });
  btn.style.backgroundImage = `url(${icon})`;
  btn.style.backgroundSize = "contain";
  btn.style.backgroundRepeat = "no-repeat";
  btn.style.backgroundPosition = "center";
  btn.style.backgroundSize = "24px";
  btn.style.padding = ".57em 8px .57em 40px";
  btn.style.aspectRatio = "1/1";
}

const id = "Navknoppen-als-iconen" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: false,
  info: {
    name: "Nav: Knoppen als iconen",
    description: "Vervangt de moduleknoppen in de bovenbalk door iconen.",
    author: "Kanti Kuijk",
  },
  activate: async () => {
    const modules = await getModules({ smartschool: true, link: true });
    const navBarBtns = document.querySelectorAll<HTMLButtonElement>(
      "#smscTopContainer>nav button.topnav__btn",
    );
    navBarBtns.forEach((btn) => {
      const display = btn.getAttribute("title") || btn.textContent.trim();
      switch (display) {
        case "Ga naar":
          setIconForNavbarButton(
            btn,
            "https://static6.smart-school.net/smsc/svg/cubes/cubes_24x24.svg",
          );
          break;
        case "Links":
          setIconForNavbarButton(
            btn,
            "https://static6.smart-school.net/smsc/svg/component_yellow/component_yellow_24x24.svg",
          );
          break;
        case "Meldingen":
          setIconForNavbarButton(
            btn,
            "https://static6.smart-school.net/smsc/svg/bell/bell_24x24.svg",
          );
          break;
        case "Zoeken":
          setIconForNavbarButton(
            btn,
            "https://static6.smart-school.net/smsc/svg/smscemoji_face_face_with_monocle/smscemoji_face_face_with_monocle_24x24.svg",
          );
          break;
        default:
          if (btn.classList.contains("topnav__btn--profile"))
            btn
              .querySelectorAll("span")
              .forEach((span) => (span.textContent = ""));
      }
    });

    const navBarLinks = document.querySelectorAll<HTMLAnchorElement>(
      "#smscTopContainer>nav a.topnav__btn",
    );
    navBarLinks.forEach((btn) => {
      const display = btn.getAttribute("title") || btn.textContent.trim();
      const href = btn.getAttribute("href");
      switch (display) {
        case "Start":
          return setIconForNavbarButton(
            btn,
            "/smsc/img/house_blue/house_blue_24x24.png",
          );
        case "Handleiding":
          return setIconForNavbarButton(
            btn,
            "https://static6.smart-school.net/smsc/svg/help_blue/help_blue_24x24.svg",
          );
        case "Afmelden":
          break;
        default:
          if (!display || !href) return;
          const module = modules.find((m) => {
            if (m.href === href) return true;
            if (m.display === display) return true;
            return false;
          });
          if (!module) return;
          if (!module.icon) return;
          setIconForNavbarButton(btn, module.icon);
      }
    });
  },
});

registerPlugin(plugin);
