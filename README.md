```
npx ember-cli@latest new ember-vite-scoped-css -b @embroider/app-blueprint --pnpm --typescript --no-welcom
```

# tailwind 4 vite

```
npx ember-apply tailwind4-vite

had to modify index.html to include the app.css file
<link href="/app/styles/app.css" rel="stylesheet">
```

# minification
`pnpm vite build -m production --minify terser`
this works but not sure of outcome, does the dist folder contents still run? https://github.com/embroider-build/embroider/blob/5d3d7dc32363a79de9e046199ce493e293cccc44/packages/vite/src/scripts.ts#L9 seems to use terser..

# ember-choices
added via pnpm add <path to tarball>

# ember-vite-scoped-css

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Ember CLI](https://cli.emberjs.com/release/)
- [Google Chrome](https://google.com/chrome/)

## Installation

- `git clone <repository-url>` this repository
- `cd ember-vite-scoped-css`
- `pnpm install`

## Running / Development

- `pnpm start`
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

- `pnpm test`
- `pnpm test:ember --server`

### Linting

- `pnpm lint`
- `pnpm lint:fix`

### Building

- `pnpm ember build` (development)
- `pnpm build` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
