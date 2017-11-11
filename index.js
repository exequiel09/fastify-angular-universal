'use strict';

const fastifyPlugin = require('fastify-plugin');
const { renderModuleFactory } = require('@angular/platform-server');

function fastifyNgUniversal(fastify, opts, next) {

  // set default value for the fastify plugin extraProviders option
  opts.extraProviders = opts.extraProviders || [];

  // add a reply decorator
  fastify.decorateReply('renderNg', function (url, options = {}) {
    const serverModule = options.serverModule || opts.serverModule;
    const documentTemplate = options.document || opts.document;
    let extraProviders = [];

    // set default value for the reply decorator extraProviders option
    options.extraProviders = options.extraProviders || [];

    // append custom extra providers if there is any
    extraProviders = extraProviders.concat(opts.extraProviders, options.extraProviders);

    // check if the server module has value or not
    if (!serverModule) {
      this.send(new Error('Missing Angular Server module to render.'));
      return;
    }

    // check if the document template has value or not
    if (!documentTemplate) {
      this.send(new Error('Missing template where the Angular app will be rendered.'));
      return;
    }

    // assemble the options
    const renderOpts = {
      document: documentTemplate,
      url: url,
      extraProviders
    };

    // render the angular application
    renderModuleFactory(serverModule, renderOpts)
      .then(html => {
        this.header('Content-Type', 'text/html').send(html);
      })
      ;
  });

  next();
}

module.exports = fastifyPlugin(fastifyNgUniversal, '>=0.33.0');


