import React from "react"
import {NextIntlClientProvider} from "next-intl"
import messages from '../messages/en-US.json'

const I18Decorator = (Story) => (
    <NextIntlClientProvider messages={messages} locale="en-US">
      <Story />
    </NextIntlClientProvider>)

    export default I18Decorator