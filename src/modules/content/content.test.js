import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONTENT_TYPES,
  createContentItem,
  listContentItems,
  updateContentItem,
  deleteContentItem,
} from './content.service.js';

test('content module exports expected CMS APIs', () => {
  assert.ok(CONTENT_TYPES.team);
  assert.equal(typeof createContentItem, 'function');
  assert.equal(typeof listContentItems, 'function');
  assert.equal(typeof updateContentItem, 'function');
  assert.equal(typeof deleteContentItem, 'function');
});
