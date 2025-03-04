import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
// import scopedStylesPlugin from './vite/scoped-css';

// import rollupScopedStyles from './vite/rollup-css';

export default defineConfig({
  plugins: [
    // scopedStylesPlugin(),
    classicEmberSupport(),
    ember(),
    // extra plugins here
    tailwindcss(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
  build: {
    cssMinify: true,
    minify: true,
  },
  // build: {
  //   rollupOptions: {
  //     // plugins: [rollupScopedStyles()],
  //   },
  // },
});
