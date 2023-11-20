import type { Preview } from "@storybook/react";
import '../app/globals.css'
import I18Decorator from "./i18n-decorator";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [I18Decorator],
  globals: {
    locale: 'en-US',
    locales: {
        "en-US": 'Amercan English'
    },
}
};

export default preview;
