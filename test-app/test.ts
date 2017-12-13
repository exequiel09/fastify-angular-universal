// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { join } from 'path';
import { readFileSync } from 'fs';

import { enableProdMode } from '@angular/core';
import * as Fastify from 'fastify';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

const t = require('tap');
const test = t.test;

const DIST_FOLDER = join(process.cwd(), 'dist');

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

function createDefaultServer(fastify) {
  // just for the sake of preventing errors associated with static assets like css and js
  fastify.register(require('fastify-static'), {
    root: join(DIST_FOLDER, 'browser'),
    prefix: '/static/'
  });

  fastify.get('/api', function (request, reply) {
    reply
      .code(200)
      .send([
        "John Doe",
        "Juan Alvarez"
      ])
      ;
  });

  // Declare a route
  fastify.get('/*', function (request, reply) {
    (reply as any).renderNg(request.req.url);
  });

  return fastify;
}

test('should return an html document', t => {
  t.plan(6);

  const fastify = createDefaultServer(Fastify());

  fastify.register(require('fastify-angular-universal'), {
    serverModule: AppServerModuleNgFactory,
    document: template,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  });

  // run the http server since we are serving a dummy api
  fastify.listen(3000, function(err) {
    if (err) {
      throw err;
    }
  });

  // retrieve the homepage
  const home = fastify
    .inject({
      url: '/',
      method: 'GET'
    })
    .then(res => {
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html');
    })
    ;

  // retrieve the about page
  const about = fastify
    .inject({
      url: '/about',
      method: 'GET'
    })
    .then(res => {
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html');
    })
    ;

  // retrieve the contact-us page
  const contactUs = fastify
    .inject({
      url: '/contact-us',
      method: 'GET'
    })
    .then(res => {
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html');
    })
    ;

  // wait for all the promises to resolve then we cleanup the server
  Promise.all([home, about, contactUs]).then(() => {
    fastify.close();
  });
});

test('should throw if serverModule option is not provided', t => {
  t.plan(3);

  const fastify = createDefaultServer(Fastify());

  fastify.register(require('fastify-angular-universal'), {
    document: template,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  });

  fastify.inject({
    url: '/',
    method: 'GET'
  }, res => {
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 500);
    t.equal(res.statusMessage, 'Internal Server Error');
    t.equal(payload.message, 'Missing Angular Server module to render.');
  });
});

test('should throw if document option is not provided', t => {
  t.plan(3);

  const fastify = createDefaultServer(Fastify());

  fastify.register(require('fastify-angular-universal'), {
    serverModule: AppServerModuleNgFactory,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  });

  fastify.inject({
    url: '/',
    method: 'GET'
  }, res => {
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 500);
    t.equal(res.statusMessage, 'Internal Server Error');
    t.equal(payload.message, 'Missing template where the Angular app will be rendered.');
  });
});


