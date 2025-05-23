This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
This Next 14 application includes full VSCode setup, gitpod integration, a storybook, swagger api documentation, localization, jest unit testing, eslint, prettier, tailwindcss, typescript, react, and stylelint built for Node 20+.

If you want to use this project as a starting point for your own project, you have my permission. A stable base version of the application can be found [here](https://github.com/rardoz/roe-the-dev/releases/tag/v1.0.0) and is a good starting point for getting your application going.

If you prefer to take what I have in the main branch instead and manually clean out the example simply delete everything IN these folders:

- `app/_services`
- `app/api/`
- `app/_components`
- `app/[locale]/`
- `messages/*.json`

Then you can configure your app:

- Add a page to `app/[locale]`
- Adjust the theme in `app/_theme`
- Adjust global styles in `app/globals.css`
- Add dictionaries under `messages`
- Setup locales under `messages/config.ts`

## Getting Started

- Copy the `.env.example` file to `.env.local` file in the project root and update accordingly
- Make sure you are on Node 20+
- Then, run the development server:

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

## Install for Apple Sillicon Chip

See the [GitPod](#local-environment-setup-with-gitpod) instructions for better a better dev experience.

- Install Rosetta 2 by running this command: `softwareupdate --install-rosetta`
- Right click on `~/Applications/VSCode.app` and click `Get info`
- Make sure the Rosetta checkbox is enabled
- Open the project using VSCode and run this command `nvm uninstall 20.9.0 && nvm install 20.9.0`
  - Note that you will need [nvm package manager](https://formulae.brew.sh/formula/nvm) installed
  - Note if you dont already have it installed, you need to run `nvm install 20.9.0`
- run `npm i` to install
- run `npm dev` to start the app
- When you are done, Right click on `~/Applications/VSCode.app` and click `Get info`
- Make sure the Rosetta checkbox is disabled

I just bought a M3 chip Macbook and noticed this new "feature" which is quite unfortunate. I will be dockerizing this application for a better dev experience.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Route Handlers](https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers) - App router and magic documentation for the API

  You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Local Environment Setup with Gitpod

Gitpod provides a VSCode editor + full environment with zero configuration needed. To setup your development environment follow these steps:

- Go to [gitpod.io](https://gitpod.io)
- Create a free account
- Give access to github and select the project from the list of repositories
- VSCode will spin up (browser or local instance of VSCode supported)
- Open VSCode > Extensions and type `@extensions` into the search bar
- Install each extension in the list

## Internationalization

This is achieved by using [next-intl](https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components).

- Messages are stored in `/messages` folder
- Additional messages can be configured in `/messages/config.ts`
- Components can be overriden per locale via the locale parameter which can be accessed via next router

## Storybook

Learn more about how the component library works with [storybook](https://storybook.js.org/docs/react/writing-stories/introduction).

- Components in the `app/_components` directory contain `story.tsx` files that are used for component documentation
- Start storybook with `npm run storybook`

## API Documentation

This app uses swagger and jsdoc in order to document the API. Learn more about it here:

- (Swagger Spec)[https://swagger.io/specification/]
- (Swagger JSDoc)[https://github.com/Surnet/swagger-jsdoc]
- (Next Swagger Doc)[https://www.npmjs.com/package/next-swagger-doc]

You can get to the local instance by starting the app server and navigating to `/api-doc`

Each API endpoint gets a JSDoc with the swagger notes so that it is autogenerated.

## Testing

Testing is provided through (Jest)[https://jestjs.io/docs/getting-started].

- To generate a coverage report run `npm run coverage`
- To run tests while coding run `npm run test`
