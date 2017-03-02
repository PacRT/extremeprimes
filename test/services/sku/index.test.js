'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('sku service', function() {
  it('registered the skus service', () => {
    assert.ok(app.service('skus'));
  });
});
