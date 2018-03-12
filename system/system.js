'use strict';

const fs = require('graceful-fs');

module.exports = class SGSystem {

  constructor(config) {
    this._config = config;
    this._templates = {};
  }

  getPath(name) {
    switch (name) {
      case 'root':
        return this._config.root;
      case 'system':
        return this._config.root + '/system';
    }
  }

  getTemplate(name) {
    if (this._templates[name] !== undefined) this._templates[name];

    const template = {
      filename: 'layouts/' + name + '.pug',
      content: fs.readFileSync(this.getPath('system') + '/layouts/' + name + '.pug'),
    }
    return this._templates[name] = template;
  }

}
