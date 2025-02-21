import Route from 'ember-route-template';
import { pageTitle } from 'ember-page-title';
import HelloWorld from '../components/hello-world.gts';
export default Route(
  <template>
    {{pageTitle "EmberViteScopedCss"}}

    <h2 id="title">Welcome to Ember</h2>

    <HelloWorld />
    <HelloWorld />

    {{outlet}}
  </template>,
);
