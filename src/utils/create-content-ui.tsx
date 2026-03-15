import { ContentScriptContext } from "#imports";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, App as AntdApp, ThemeConfig } from "antd";
import ReactDOM from "react-dom/client";
import "~/assets/tailwind.css";

export const MAX_Z_INDEX = 9999999;

export async function createContentUi(
  ctx: ContentScriptContext,
  name: string,
  position: ContentScriptPositioningOptions["position"],
  appBlock: (
    ui: ShadowRootContentScriptUi<any>,
    root: ReactDOM.Root,
    el: HTMLElement,
    container: HTMLElement,
  ) => React.ReactNode,
) {
  const theme: ThemeConfig | undefined =
    position === "modal"
      ? void 0
      : {
          components: {
            Popover: {
              zIndexPopup: MAX_Z_INDEX,
            },
            Message: {
              zIndexPopup: MAX_Z_INDEX,
            },
            Tooltip: {
              zIndexPopup: MAX_Z_INDEX,
            },
            Modal: {
              zIndexPopupBase: MAX_Z_INDEX,
            },
            Dropdown: {
              zIndexPopupBase: MAX_Z_INDEX,
            },
          },
        };

  const ui = await createShadowRootUi(ctx, {
    name: name,
    position: position,
    zIndex: MAX_Z_INDEX,
    anchor: "body",
    append: "first",
    onMount(container, shadowRoot) {
      const el = document.createElement("div");
      container.append(el);
      // render
      const root = ReactDOM.createRoot(el);
      root.render(
        <StyleProvider container={shadowRoot} layer>
          <ConfigProvider
            getPopupContainer={() => shadowRoot as any}
            theme={theme}
          >
            <AntdApp>{appBlock(ui, root, el, container)}</AntdApp>
          </ConfigProvider>
        </StyleProvider>,
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
    },
  });

  ui.mount();
}
