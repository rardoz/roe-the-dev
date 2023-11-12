This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Internationalization

This is achieved by using [next-intl](https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components).

- Messages are stored in `/messages` folder
- Additional messages can be configured in `/messages/config.ts`
- Components can be overriden per locale via the locale parameter which can be accessed via next router

## Storybook

Learn more about how the component library works with [storybook](https://storybook.js.org/docs/react/writing-stories/introduction).

- Components in the `app/_components` directory contain `story.ts` files that are used for component documentation
- Start storybook with `npm run storybook`

## API Documentation

This app uses swagger and jsdoc in order to document the API. Learn more about it here:

- (Swagger Spec)[https://swagger.io/specification/]
- (Swagger JSDoc)[https://github.com/Surnet/swagger-jsdoc]
- (Next Swagger Doc)[https://www.npmjs.com/package/next-swagger-doc]

## TODO:

[] Connect SF
[] Deploy to vercel
[] Authentication
[] GTM
