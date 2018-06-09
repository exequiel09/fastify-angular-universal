# fastify-angular-universal

[![Master - Build Status][img-travis-master]][link-travis]
[![Master - Build Status][img-appveyor-master]][link-appveyor-master]
[![LICENSE][img-license]][link-license]

Angular server-side rendering support for Fastify using Angular Universal.

## Install

``
npm install --save fastify-angular-universal
``

## Usage

Add it to you project with `register` and pass the required options.

Follow the tutorial on how to perform SSR in Angular with Angular CLI [here][link-angular-cli-universal-rendering] ONLY UNTIL step 3.

For the steps 4 and onwards use the following `server.ts` or check out the [`server.ts`][link-server-ts] in the test-app directory

```typescript
// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { join } from 'path';
import { readFileSync } from 'fs';

import { enableProdMode } from '@angular/core';
import * as fastify from 'fastify';

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/<your-project-name-here>-server/main');
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

const PORT = process.env.PORT || 3000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, '<your-project-name-here>', 'index.html')).toString();

const app = fastify();

app.register(require('fastify-static'), {
  root: join(DIST_FOLDER, '<your-project-name-here>'),
  prefix: '/static/'
});

// register the fastify-angular-universal to your application together with the required options
app.register(require('fastify-angular-universal'), {
  serverModule: AppServerModuleNgFactory,
  document: template,
  extraProviders: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
});

// Declare a route
app.get('/*', function (request, reply) {
  // NOTE: you can also pass the options for the fastify-angular-universal fastify plugin 
  //       as second parameter to the `.renderNg()` function.
  // 
  //       Example: `reply.renderNg(url, options)`
  (reply as any).renderNg(request.req.url);
});

// Run the server!
app.listen(PORT, function (err) {
  if (err) {
    throw err;
  }

  console.log(`server listening on ${app.server.address().port}`);
});
```

## Options

This plugin allow you to specify options:

- `serverModule` to specify the NgModuleFactory to be used in rendering an Angular app in the server
- `document` to specify the template where the Angular app will be rendered
- `extraProviders` to specify additional providers to be used by the Angular app. (optional)

## License

[MIT][link-license].

<!-- [Images] ::start -->
[img-travis-master]: https://travis-ci.org/exequiel09/fastify-angular-universal.svg?branch=master
[img-appveyor-master]: https://ci.appveyor.com/api/projects/status/5hg5qsav8q2xjqah/branch/master?svg=true
[img-license]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
<!-- [Images] ::end -->


<!-- [Links] ::start -->
[link-license]: ./LICENSE
[link-travis]: https://travis-ci.org/exequiel09/fastify-angular-universal
[link-appveyor-master]: https://ci.appveyor.com/project/exequiel09/fastify-angular-universal/branch/master
[link-angular-cli-universal-rendering]: https://github.com/angular/angular-cli/wiki/stories-universal-rendering
[link-server-ts]: https://github.com/exequiel09/fastify-angular-universal/blob/master/test-app/server.ts
<!-- [Links] ::end -->


