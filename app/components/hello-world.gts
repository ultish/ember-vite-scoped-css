import Component from '@glimmer/component';
import { TooManyChoices } from 'ember-choices';

export default class HelloWorld extends Component {
  get name() {
    return 'jimmy';
  }

  get chargeCodes() {
    return [
      {
        choice: {
          id: 1,
          name: 'code1',
          group: undefined,
        },
        selected: true,
      },
      {
        choice: {
          id: 2,
          name: 'code2',
          group: undefined,
        },
        selected: false,
      },
    ];
  }

  <template>
    <style scoped>
      div {
        color: red;
      }
      p {
        color: blue;
      }
    </style>
    <button class="btn btn-primary" type="button">Button</button>
    <div class="text-2xl text-blue-500">Hello World</div>
    RELAKY
    <TooManyChoices @choices={{this.chargeCodes}} as |cc|>
      <option
        selected={{if cc.selected "selected"}}
        value={{cc.choice.id}}
      >{{cc.choice.name}}</option>
    </TooManyChoices>

    <div>
      {{this.name}}

      <div>
        1
        <div>2sssss s

          <p>355555</p>
        </div>
      </div>
    </div>
  </template>
}
