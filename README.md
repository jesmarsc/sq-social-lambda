<p align="center">
  <a href="https://quest.stellar.org/">
    <img alt="Stellar Quest" height="128" src="./src/assets/logo.svg">
    <h1 align="center">Stellar Quest Social</h1>
  </a>
</p>

<p align="center">
  <a aria-label="Join our Discord" href="https://discord.gg/8FhvuKb" target="_blank">
    <img alt="Discord" src="https://img.shields.io/discord/763798356484161566.svg?style=flat-square&labelColor=000000&color=4630EB&logo=discord&logoColor=FFFFFF&label=" />
  </a>
  <a aria-label="Follow us on Twitter" href="https://github.com/expo/expo/blob/master/LICENSE" target="_blank">
    <img alt="Twitter" src="https://img.shields.io/twitter/follow/StellarQuest.svg?style=flat-square&label=Follow%20%40StellarQuest&logo=TWITTER&logoColor=FFFFFF&labelColor=00aced&logoWidth=15&color=lightgray" target="_blank" />
  </a>
  <a aria-label="About Stellar" href="https://www.stellar.org/" target="_blank">
    <img width="52" alt="Stellar" src="https://assets-global.website-files.com/5deac75ecad2173c2ccccbc7/5dec89605049671996147f61_Stellar_lockup_white_RGB.svg" />
  </a>
</p>

Stellar Quest Social is a micro-service that will allow you to generate images that are meant to be shared on social media.

- [⚙️ Setup](#-setup)
- [🗺 Project Layout](#-project-layout)
- [🖼️ Image Generation](#-image-generation)
- [🏷️ Metatags Generation](#-metatags-generation)
- [❓ FAQ](#-faq)

## ⚙️ Setup

<p>This micro-service deploys to AWS Lambda and is built with <a aria-label="fabric.js github" href="https://github.com/fabricjs/fabric.js">Fabric.js</a>, <a aria-label="node-canvas github" href="https://github.com/Automattic/node-canvas">node-canvas</a>, and <a aria-label="typescript documentation" href="https://www.typescriptlang.org/">Typescript</a>. Read their docs to get familiar with the development workflow.</p>

- Install: `npm install`
- Run development: `npm run dev`
- Deploy: `npm run deploy` **_(please read the instructions below to have a successful deployment.)_**

This micro-service makes use of Serverless Framework to handle deployments to AWS Lambda. Before deploying make sure the following conditions are met:

- You have a Serverless account set up with your local environment.

  1. Register to Serverless and set up <a aria-label="serverless-cli set up" href="https://github.com/serverless/components#quick-start">serverless-cli</a> (ensure you use `serverless login` afterwards.)

  2. <a aria-label="iam user set up" href="https://www.serverless.com/framework/docs/providers/aws/guide/credentials/">Create and add an IAM User</a> to your Serverless account. You can accomplish this by going to the Serverless dashboard and adding a provider in your org settings.

- You have set up the required Lambda layer.

  1. We have to set up a Lambda layer that contains the larger dependencies of this micro-service (node-canvas and Fabric.js.) Currently this is deployed using this <a aria-label="lambda layer deployment" href="https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:990551184979:applications~lambda-layer-canvas-nodejs">Lambda layer</a> through the AWS dashboard.

  2. After deploying, the Lambda layer is given an ARN which should be copied and pasted into your serverless.yml.

     ```
     functions:
       image-generator:
         handler: src/handler.default
         events:
           - http:
               method: get
               path: '{proxy+}'
         environment:
           NODE_PATH: './:/opt/nodejs/node_modules'
           FONTCONFIG_PATH: '/var/task/fonts'
         layers:
           - *PASTE HERE*
     ```

- You have added this project to your Serverless dashboard.

  1. Manually add this project to your Serverless dashboard. Navigate to the Serverless dashboard and create a new app. Then add an existing Serverless Framework project and follow the instructions given. You'll be asked to associate an IAM account and to add some entries to the serverless.yml located in the root of this repo.

- Finally, you can call `npm run deploy` to deploy your Lambda function.

## 🗺 Project Layout

- [`assets`](/src/assets) All assets go here (including assets generated through template functions.)
- [`constants`](/src/constants) Constants that are consumed across the Lambda function.
- [`series`](/src/series) JSON data of all the Stellar Quest series.
- [`shims`](/src/shims) Shims required to make the Lambda function work (currently has a shim for lambda-api.)
- [`templates`](/src/templates) Functions that help generate the images (more on this below.)
- [`types`](/src/types) Custom types.
- [`utils`](/src/utils) General utility functions.
- [`handler.ts`](/src/handler.ts) The entry point to the Lambda function.

## 🖼️ Image Generation

Images are generated using Fabric.js and node-canvas. The functions that help generate certain images are located in [`src/templates`](/src/templates). For perfomance reasons, the current flow is to pre-generate non-dynamic parts of the image (primarily backgrounds) and store them inside of [`src/assets`](/src/assets). Template files that contain `Background` in their name are some examples that pre-generate parts of the image. These files are ran using `tsc filename.ts`, and their image outputs are automatically saved into [`src/assets`](/src/assets). Alternatively, these pre-generated images can be made in some 3rd party software and added to the project. Later, these pre-generated images are loaded in using a custom helper function at runtime and are drawn over with the dynamic parts. The functions responsible for generating the dynamic parts are also located in [`src/templates`](/src/templates).

Supported Endpoints:

- **GET** `/completion?series={:series}&quest={:quest}&position={:position}`
  - **series** _integer_ REQUIRED
  - **quest** _integer_ REQUIRED
  - **position** _integer_ (optional)

## 🏷️ Metatags Generation

This micro-service also had routes for generating metatags which have been removed and migrated over to a Cloudflare worker. The utility fuctions still remain in this repository but are not used.

Metatag generation must also be dynamic (since the image url is dynamic) but that becomes an issue when the front-end application is a SPA. To bypass this, an endpoint must be created somewhere that differentiates between regular users and social media bots. Currently, the Cloudflare worker checks the user agent of the requests. If it detects a bot, then it returns the metatags with the dynamic image url attached. Otherwise, it simply redirects the user to the Stellar Quest landing page. The Lambda image url used for the metatags is generated by proxying the path and parameters from the worker request url. If a direct link to the image is needed, a link to the Lambda function with the correct path and parameters can be used instead of the worker url.

Clouflare Worker URL Example:

`https://stellar-quest-dev.sdf-ecosystem.workers.dev/social/completion?set=3&quest=1&position=1`

## ❓ FAQ

- Learn more about SDF [here](https://www.stellar.org/community/faq).
