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
      p {
        color: blue;
      }
    </style>

    <div>
      {{this.name}}

      <div>
        1
        <div>2

          <p>355555</p>
        </div>
      </div>
    </div>
  </template>
}
