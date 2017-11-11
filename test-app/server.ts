// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { join } from 'path';
import { readFileSync } from 'fs';

import { enableProdMode } from '@angular/core';
import * as fastify from 'fastify';

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

const PORT = process.env.PORT || 3000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

const app = fastify();

app.register(require('fastify-static'), {
  root: join(DIST_FOLDER, 'browser'),
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
  (reply as any).renderNg(request.req.url);
});

// Run the server!
app.listen(PORT, function (err) {
  if (err) {
    throw err;
  }

  console.log(`server listening on ${app.server.address().port}`);
});


