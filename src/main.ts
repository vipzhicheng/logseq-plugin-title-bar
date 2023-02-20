import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
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
    template: `<a data-on-click="openMyToySettings" title="My Toy Settings">${config?.name}</a> <a class="cursor-pointer" data-on-click="openPluginSettings" style="display: inline-block;" title="Plugin Settings">
    <i class="ti ti-settings" style=""></i>
    </a>`,
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
    `,
  });
};

const main = async () => {
  logseq.provideModel({
    openPluginSettings() {
      logseq.App.invokeExternalCommand("logseq.ui/toggle-settings");
    },
    openMyToySettings() {
      logseq.showSettingsUI();
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
