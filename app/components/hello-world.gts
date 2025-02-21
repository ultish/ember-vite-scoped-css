import Component from '@glimmer/component';

export default class HelloWorld extends Component {
  get name() {
    return 'jimmy';
  }

  <template>
    <style scoped>
      div {
        color: red;
      }
    </style>

    <div>
      {{this.name}}
    </div>
  </template>
}
