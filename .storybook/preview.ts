import type { Preview } from "@storybook/react";
import '../app/globals.css'
import i18n from './i18next';

const preview: Preview = {
  parameters: {
    i18n,
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globals: {
    locale: 'en-US',
    locales: {
        "en-US": 'Amercan English',
        "es-US": 'Mexican Spanish'
    },
}
};

export default preview;
