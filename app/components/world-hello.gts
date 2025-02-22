import Component from '@glimmer/component';

export default class WorldHello extends Component {
  get name() {
    return 'jimmy';
  }

  <template>
    <style scoped>
      div {
        color: green;
      }
      p {
        color: pink;
      }
    </style>

    <div>
      {{this.name}}

      <div>
        1
        <div>2

          <p>3</p>
        </div>
      </div>
    </div>
  </template>
}
