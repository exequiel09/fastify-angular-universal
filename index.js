'use strict';

const fastifyPlugin = require('fastify-plugin');
const { renderModuleFactory } = require('@angular/platform-server');

function fastifyNgUniversal(fastify, opts, next) {
  if (!opts.serverModule) {
    next(new Error('Missing Angular Server module to render.'));
    return;
  }

  if (!opts.document) {
    next(new Error('Missing template where the Angular app will be rendered.'));
    return;
  }

  let extraProviders = [];

  // append custom extra providers if there is any
  if (opts.extraProviders && Array.isArray(opts.extraProviders)) {
    extraProviders = extraProviders.concat(opts.extraProviders);
  }

  // add a reply decorator
  fastify.decorateReply('renderNg', function (url) {
    const renderOpts = {
      document: opts.document,
      url: url,
      extraProviders
    };

    renderModuleFactory(opts.serverModule, renderOpts)
      .then(html => {
        this.header('Content-Type', 'text/html').send(html);
      })
      ;
  });

  next();
}

module.exports = fastifyPlugin(fastifyNgUniversal, '>=0.33.0');


