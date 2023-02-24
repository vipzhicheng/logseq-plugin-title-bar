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
    <a class="cursor-pointer" data-on-click="resetSidebarTempPage" style="display: inline-block;" title="Go Today">
      <i class="ti ti-recycle" style=""></i>
    </a>
    <a class="cursor-pointer" data-on-click="readonly" style="display: inline-block;" title="Go Today">
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

const main = async () => {
  top?.document.getElementById("root")?.addEventListener("mousedown", (e) => {
    if (logseq.settings?.readonly) {
      setTimeout(async () => {
        await logseq.Editor.exitEditingMode(false);
      }, 100);
    }
  });
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
      await setTitle();
    },
    async resetSidebarTempPage() {
      const tempPageName = "Temp Page";
      const page = await logseq.Editor.getPage(tempPageName);
      if (page) {
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
};

logseq.ready().then(main).catch(console.error);
