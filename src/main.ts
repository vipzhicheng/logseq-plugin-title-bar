import "@logseq/libs";
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

const main = async () => {
  logseq.provideModel({
    openPluginSettings() {
      logseq.App.invokeExternalCommand("logseq.ui/toggle-settings");
    },
  });
  const config = await logseq.App.getCurrentGraph();
  // logseq.App.registerUIItem("toolbar", {
  //   key: "logseq-my-toy",
  //   template: `
  //    <strong>Hello</strong>
  //   `,
  // });

  const container = top?.document.querySelector(
    ".cp__header>.r"
  ) as HTMLElement;
  const titleEl = top!.document.createElement("div");
  titleEl.id = "logseq-title";
  container.insertAdjacentElement("afterbegin", titleEl);

  logseq.provideUI({
    template: `${config?.name} <a class="cursor-pointer" data-on-click="openPluginSettings" style="display: inline-block;" title="Plugin Settings">
    <i class="ti ti-settings" style=""></i>
    </a>`,
    path: "#logseq-title",
    replace: true,
    key: "logseq-my-toy",
  });

  logseq.provideStyle({
    key: "logseq-my-toy",
    style: `

#logseq-title {
  padding: 2rem;
  font-size: 1rem;
  font-weight: bold;
  color: darkviolet;
  flex: 1;
}



    `,
  });

  logseq.App.onCurrentGraphChanged(async () => {
    const config = await logseq.App.getCurrentGraph();
    logseq.provideUI({
      template: `${config?.name} <a class="cursor-pointer" data-on-click="openPluginSettings" style="display: inline-block;" title="Plugin Settings">
      <i class="ti ti-settings" style=""></i>
      </a>`,
      path: "#logseq-title",
      // reset: true,
      replace: true,
      key: "logseq-my-toy",
    });
  });
};

logseq.ready().then(main).catch(console.error);
