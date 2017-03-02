'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('orderitem service', function() {
  it('registered the orderitems service', () => {
    assert.ok(app.service('orderitems'));
  });
});
