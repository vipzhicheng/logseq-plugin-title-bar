import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import dayjs from "dayjs";
import "./style.css";

function createModel() {
  return {
    openModal() {
      logseq.showMainUI();
    },
  };
}

async function triggerBlockModal() {
  createModel().openModal();
}

const EVENTS_TO_PREVENT = [
  "mousedown",
  "mousemove",
  "mouseup",
  "click",
  "keydown",
];

const KEYS_TO_PREVENT = new Set([
  "Enter",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Backspace",
]);

function preventEditing(e: any) {
  // keydown
  if (e.type === "keydown") {
    if (KEYS_TO_PREVENT.has(e.key)) {
      e.stopPropagation();
    }
    return;
  }

  // mouse and click
  const path = e.composedPath();

  // Let go of any links.
  if (path[0]?.tagName.toLowerCase() === "a") return;

  for (let i = 0; i < path.length; i++) {
    // Let go of block refs.
    if (path[i].classList?.contains("block-ref")) return;
    // Let go of tocgen links.
    if (path[i].classList?.contains("kef-tocgen-page")) return;
    if (path[i].classList?.contains("kef-tocgen-block")) return;
    // Let go of CodeMirror code blocks.
    if (path[i].classList?.contains("CodeMirror")) return;
    // Let go of favorite items and recent items.
    if (path[i].classList?.contains("favorite-item")) return;
    if (path[i].classList?.contains("recent-item")) return;
    if (path[i].classList?.contains("ls-icon-maximize")) return;

    if (path[i].id === "left-container") {
      if (path[i - 1]?.id === "main-container") {
        e.stopPropagation();
      }
      return;
    }
  }
}

const defineSettings: SettingSchemaDesc[] = [
  {
    key: "titleColor",
    title: "Title Color",
    description: "Set title color",
    type: "string",
    inputAs: "color",
    default: "#ff0000",
  },
];

logseq.useSettingsSchema(defineSettings);

const setTitle = async () => {
  const config = await logseq.App.getCurrentGraph();
  logseq.provideUI({
    template: `<a data-on-click="openMyToySettings" title="My Toy Settings">${
      config?.name
    }</a>
    <a class="cursor-pointer" data-on-click="openPluginSettings" style="display: inline-block;" title="Plugin Settings">
      <i class="ti ti-settings" style=""></i>
    </a>
    <a class="cursor-pointer" data-on-click="focusMainContent" style="display: inline-block;" title="Focus">
      <i class="ti ti-viewfinder" style=""></i>
    </a>
    <a class="cursor-pointer" data-on-click="showAllSidebars" style="display: inline-block;" title="Show all sidebars">
      <i class="ti ti-layout-distribute-vertical" style=""></i>
    </a>
    <a class="cursor-pointer" data-on-click="goToday" style="display: inline-block;" title="Go Today">
      <i class="ti ti-calendar" style=""></i>
    </a>
    <a class="cursor-pointer" data-on-click="resetSidebarTempPage" style="display: inline-block;" title="Reset Temp Page">
      <i class="ti ti-recycle" style=""></i>
    </a>
    <a class="cursor-pointer" data-on-click="readonly" style="display: inline-block;" title="Readonly">
    <i class="ti ti-${logseq.settings?.readonly ? "edit" : "eye"}" style=""></i>
  </a>

  `,
    path: "#logseq-title",
    // reset: true,
    replace: true,
    key: "logseq-my-toy",
  });

  logseq.provideStyle({
    key: "logseq-my-toy-title",
    style: `
#logseq-title {
  padding: 2rem;
  font-size: 1rem;
  font-weight: bold;
  flex: 1;
}

#logseq-title a {
  color: ${logseq.settings?.titleColor || "#ff0000"};
}

#my-toy--logseq-my-toy a {
  cursor: pointer !important;
}
    `,
  });
};

const checkReadonly = async () => {
  const appContainer = parent.document.getElementById("app-container");
  if (appContainer) {
    if (!logseq.settings?.readonly) {
      for (const event of EVENTS_TO_PREVENT) {
        parent.document.documentElement.removeEventListener(
          event,
          preventEditing,
          {
            capture: true,
          }
        );
      }
      parent.document.body.style.height = "";
    } else {
      await logseq.Editor.exitEditingMode();
      parent.document.body.style.height = "auto";
      for (const event of EVENTS_TO_PREVENT) {
        parent.document.documentElement.addEventListener(
          event,
          preventEditing,
          {
            capture: true,
            passive: true,
          }
        );
      }
    }
  }
};

const main = async () => {
  await checkReadonly();
  logseq.provideModel({
    async readonly() {
      const settings: any = logseq.settings;
      if (!settings?.readonly) {
        settings.readonly = 1;
        logseq.updateSettings(settings);
      } else {
        settings.readonly = 0;
        logseq.updateSettings(settings);
      }
      await checkReadonly();
      await setTitle();
    },
    async resetSidebarTempPage() {
      const tempPageName = "Temp Page";
      const currentPage = await logseq.Editor.getCurrentPage();
      if (currentPage) {
        const tempPage = await logseq.Editor.getPage(tempPageName);
        if (tempPage) {
          await logseq.Editor.deletePage(tempPageName);
        }

        await logseq.Editor.createPage(
          tempPageName,
          {},
          {
            createFirstBlock: true,
            redirect: false,
          }
        );

        const newPage = await logseq.Editor.getPage(tempPageName);
        if (newPage) {
          await logseq.App.pushState("page", {
            name: currentPage.name,
          });
          await logseq.Editor.openInRightSidebar(newPage.uuid);
          setTimeout(async () => {
            const blocks = await logseq.Editor.getPageBlocksTree(tempPageName);
            await logseq.Editor.editBlock(blocks[0].uuid);
          }, 300);
        }
      }
    },
    async openPluginSettings() {
      await logseq.App.invokeExternalCommand("logseq.ui/toggle-settings");
    },
    openMyToySettings() {
      logseq.showSettingsUI();
    },
    async focusMainContent() {
      logseq.App.setLeftSidebarVisible(false);
      logseq.App.setRightSidebarVisible(false);
    },
    async showAllSidebars() {
      logseq.App.setLeftSidebarVisible(true);
      logseq.App.setRightSidebarVisible(true);
    },
    async goToday() {
      const config = await logseq.App.getUserConfigs();
      if (!config.enabledJournals) {
        logseq.UI.showMsg("Journal feature not enabled", "error");
      }
      const format = config.preferredDateFormat
        .replace("yyyy", "YYYY")
        .replace("dd", "DD")
        .replace("do", "Do")
        .replace("EEEE", "dddd")
        .replace("EEE", "ddd")
        .replace("EE", "dd")
        .replace("E", "ddd");

      const pageName = dayjs(new Date()).format(format);
      logseq.App.pushState("page", { name: pageName });
    },
  });

  const container = top?.document.querySelector(
    ".cp__header>.r"
  ) as HTMLElement;
  const titleEl = top!.document.createElement("div");
  titleEl.id = "logseq-title";
  container.insertAdjacentElement("afterbegin", titleEl);

  await setTitle();

  logseq.App.onCurrentGraphChanged(async () => {
    await setTitle();
  });

  logseq.onSettingsChanged(async () => {
    await setTitle();
  });

  // logseq.beforeunload(async () => {
  //   for (const event of EVENTS_TO_PREVENT) {
  //     parent.document.documentElement.removeEventListener(
  //       event,
  //       preventEditing,
  //       {
  //         capture: true,
  //       }
  //     );
  //   }
  //   parent.document.body.style.height = "";
  // });
};

logseq.ready().then(main).catch(console.error);
