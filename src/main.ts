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
    default: "#cd18ac",
  },

  {
    key: "tempPageName",
    title: "Temp Page Name",
    description: "Set temp page name",
    type: "string",
    default: "Temp Page",
  },

  {
    key: "defaultTitleAction",
    title: "Default Title Action",
    description: "Set default title action",
    type: "enum",
    enumChoices: [
      "openTitleBarSettings",
      "openPluginSettings",
      "openMarketplace",
      "focusMainContent",
      "showAllSidebars",
      "goToday",
      "goSidebarTempPage",
      "toggleReadonly",
    ],
    enumPicker: "select",
    default: "openTitleBarSettings",
  },
  // @ts-ignore
  {
    key: "action_switches",
    title: "Action Switches",
    type: "heading",
  },

  {
    key: "openTitleBarSettings",
    title: "",
    description: "Toggle openTitleBarSettings",
    type: "boolean",
    default: true,
  },
  {
    key: "openPluginSettings",
    title: "",
    description: "Toggle openPluginSettings",
    type: "boolean",
    default: true,
  },
  {
    key: "openMarketplace",
    title: "",
    description: "Toggle openMarketplace",
    type: "boolean",
    default: true,
  },
  {
    key: "focusMainContent",
    title: "",
    description: "Toggle focusMainContent, hide all sidebars",
    type: "boolean",
    default: true,
  },
  {
    key: "showAllSidebars",
    title: "",
    description: "Toggle showAllSidebars",
    type: "boolean",
    default: true,
  },
  {
    key: "goToday",
    title: "",
    description: "Toggle goToday",
    type: "boolean",
    default: true,
  },
  {
    key: "goSidebarTempPage",
    title: "",
    description: "Toggle goSidebarTempPage",
    type: "boolean",
    default: true,
  },
  {
    key: "toggleReadonly",
    title: "",
    description: "Toggle toggleReadonly",
    type: "boolean",
    default: true,
  },

  {
    key: "toggleForPrint",
    title: "",
    description: "Toggle for print",
    type: "boolean",
    default: true,
  },
];

logseq.useSettingsSchema(defineSettings);

const setTitle = async () => {
  const config = await logseq.App.getCurrentGraph();
  const titleBarArray = [
    `<a data-on-click="defaultTitleAction" title="${config?.name}">${config?.name}</a>`,
  ];
  if (logseq.settings?.openTitleBarSettings) {
    titleBarArray.push(
      `<a data-on-click="openTitleBarSettings" title="Title Bar Settings">
      <i class="ti ti-adjustments-horizontal" style=""></i>
    </a>`
    );
  }
  if (logseq.settings?.openPluginSettings) {
    titleBarArray.push(
      `<a data-on-click="openPluginSettings" style="display: inline-block;" title="Settings">
        <i class="ti ti-settings" style=""></i>
      </a>`
    );
  }
  if (logseq.settings?.openMarketplace) {
    titleBarArray.push(
      `<a data-on-click="openMarketplace" style="display: inline-block;" title="Marketplace">
        <i class="ti ti-puzzle-2" style=""></i>
      </a>`
    );
  }
  if (logseq.settings?.focusMainContent) {
    titleBarArray.push(
      `<a data-on-click="focusMainContent" style="display: inline-block;" title="Focus">
        <i class="ti ti-viewfinder" style=""></i>
      </a>`
    );
  }
  if (logseq.settings?.showAllSidebars) {
    titleBarArray.push(
      `<a data-on-click="showAllSidebars" style="display: inline-block;" title="Show all sidebars">
        <i class="ti ti-layout-distribute-vertical" style=""></i>
      </a>`
    );
  }
  if (logseq.settings?.goToday) {
    titleBarArray.push(
      `<a data-on-click="goToday" style="display: inline-block;" title="Go Today">
        <i class="ti ti-calendar" style=""></i>
      </a>`
    );
  }
  if (logseq.settings?.goSidebarTempPage) {
    titleBarArray.push(
      `<a data-on-click="goSidebarTempPage" style="display: inline-block;" title="Go Temp Page">
        <i class="ti ti-recycle" style=""></i>
      </a>`
    );
  }
  if (logseq.settings?.toggleReadonly) {
    titleBarArray.push(
      `<a data-on-click="toggleReadonly" style="display: inline-block;" title="Readonly Mode">
        <i class="ti ti-${
          logseq.settings?.readonly ? "edit" : "eye"
        }" style=""></i>
      </a>`
    );
  }

  if (logseq.settings?.toggleForPrint) {
    const currentPage = await logseq.Editor.getCurrentPage();
    let iconTitle = "Toggle for print";
    titleBarArray.push(
      `<a data-on-click="toggleForPrint" style="display: inline-block;" title="${iconTitle}">
        <i class="ti ti-${
          !logseq.settings?.onlyShowContent ? "wash-tumble-dry" : "wash-tumble-off"
        }" style=""></i>
      </a>`
    );
  }

  logseq.provideUI({
    template: titleBarArray.join("\n"),
    path: "#logseq-title",
    // reset: true,
    replace: true,
    key: "logseq-title-bar",
  });

  logseq.provideStyle({
    key: "logseq-title-bar-title",
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

#title-bar--logseq-title-bar a {
  cursor: pointer !important;
}
    `,
  });
};

const checkReferences = async (delay = false) => {
  const currentPage = await logseq.Editor.getCurrentPage();
  if (currentPage) {
    const handleReferences = () => {
      const pageEls = parent.document.querySelectorAll("#main-content-container .references, #main-content-container .page-hierarchy");

      for (let pageEl of pageEls) {

        if (pageEl) {
          if (logseq.settings?.onlyShowContent) {
            (pageEl as HTMLElement).style.display = "none";
          } else {
            (pageEl as HTMLElement).style.display = "";
          }
        }
      }
    };

    if (delay) {
      setTimeout(handleReferences, 3000);
    } else {
      handleReferences();
    }
  }
};

const checkPageTitle = async (delay = false) => {
  const currentPage = await logseq.Editor.getCurrentPage();
  if (currentPage) {
    const handlePageTitle = () => {
      const pageEl = parent.document.querySelector(".ls-page-title");
      if (pageEl && pageEl.parentElement) {
        if (logseq.settings?.onlyShowContent) {
          pageEl.parentElement.style.display = "none";
        } else {
          pageEl.parentElement.style.display = "";
        }
      }
    };

    if (delay) {
      setTimeout(handlePageTitle, 300);
    } else {
      handlePageTitle();
    }
  }
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
  await checkPageTitle(true);
  await checkReferences(true);
  const actionModels: any = {
    async openMarketplace() {
      await logseq.App.invokeExternalCommand("logseq.ui/goto-plugins");
    },
    async toggleReadonly() {
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
    async toggleForPrint() {
      const settings: any = logseq.settings;
      if (!settings?.onlyShowContent) {
        settings.onlyShowContent = 1;
        logseq.updateSettings(settings);
      } else {
        settings.onlyShowContent = 0;
        logseq.updateSettings(settings);
      }
      await checkPageTitle();
      await checkReferences();
    },
    async goSidebarTempPage() {
      const tempPageName = logseq.settings?.tempPageName || "Temp Page";
      const tempPage = await logseq.Editor.getPage(tempPageName);
      if (!tempPage) {
        await logseq.Editor.createPage(
          tempPageName,
          {},
          {
            createFirstBlock: true,
            redirect: false,
          }
        );
      }

      const newPage = await logseq.Editor.getPage(tempPageName);
      if (newPage) {
        await logseq.Editor.openInRightSidebar(newPage.uuid);
        setTimeout(async () => {
          const blocks = await logseq.Editor.getPageBlocksTree(tempPageName);
          await logseq.Editor.editBlock(blocks[0].uuid);
        }, 300);
      }
    },
    async openPluginSettings() {
      await logseq.App.invokeExternalCommand("logseq.ui/toggle-settings");
    },
    openTitleBarSettings() {
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
  };

  actionModels.defaultTitleAction = async () => {
    const settings: any = logseq.settings;
    settings.defaultTitleAction =
      settings?.defaultTitleAction || "openPluginSettings";
    if (
      settings?.defaultTitleAction &&
      actionModels[settings?.defaultTitleAction]
    ) {
      actionModels[settings?.defaultTitleAction]();
    }
  };

  logseq.provideModel(actionModels);

  const container = top?.document.querySelector(
    ".cp__header>.r"
  ) as HTMLElement;
  const titleEl = top!.document.createElement("div");
  titleEl.id = "logseq-title";
  container.insertAdjacentElement("afterbegin", titleEl);

  await setTitle();

  logseq.App.onCurrentGraphChanged(async () => {
    await setTitle();
    await checkPageTitle(true);
    await checkReferences(true)
  });

  logseq.App.onRouteChanged(async () => {
    await setTitle();
    await checkPageTitle(true);
    await checkReferences(true)
  });

  logseq.onSettingsChanged(async () => {
    await setTitle();
  });
};

logseq.ready().then(main).catch(console.error);
