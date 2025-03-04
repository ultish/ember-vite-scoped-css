import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-vite-scoped-css/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | hello-world', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<HelloWorld />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <HelloWorld>
        template block text
      </HelloWorld>
    `);

    assert.dom().hasText('template block text');
  });
});
