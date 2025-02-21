import { preprocess, print, traverse, builders } from '@glimmer/syntax';
import postcss from 'postcss';
import { createHash } from 'crypto';

// Use an object or Map to store styles per file, avoiding global state issues
const styleRegistry = new Map();

function generateUniqueDataAttr(id) {
  const hash = createHash('md5').update(id).digest('hex');
  return `${hash.slice(0, 10)}-${hash.slice(10, 20)}`;
}

function rewriteSelectors(css, dataAttrValue) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    rule.selectors = rule.selectors.map((selector) => {
      const match = selector.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
      if (match) {
        return `${match[0]}[data-scopedcss-${dataAttrValue}]`;
      }
      return `[data-scopedcss-${dataAttrValue}]${selector}`;
    });
  });
  return root.toString();
}

function processTemplateAST(templateContent, dataAttr) {
  const ast = preprocess(templateContent);
  let styleContent = '';

  traverse(ast, {
    ElementNode(node) {
      if (
        node.tag === 'style' &&
        node.attributes.some((attr) => attr.name === 'scoped')
      ) {
        styleContent = node.children
          .filter((child) => child.type === 'TextNode')
          .map((child) => child.chars)
          .join('');
        return builders.text('');
      }
    },
  });

  traverse(ast, {
    ElementNode(node) {
      if (!['style', 'script'].includes(node.tag.toLowerCase())) {
        const existingAttr = node.attributes.find(
          (attr) => attr.name === dataAttr,
        );
        if (!existingAttr) {
          node.attributes.push(builders.attr(dataAttr, builders.text('')));
        }
      }
    },
  });

  const modifiedTemplate = print(ast).trim();
  return { modifiedTemplate, styles: styleContent };
}

export default function scopedStylesPlugin() {
  return {
    name: 'scoped-styles',
    enforce: 'pre',

    // Clear styles at the start of a build or dev session (optional for dev consistency)
    buildStart() {
      styleRegistry.clear();
    },

    transform(code, id) {
      if (!id.endsWith('.gts')) return;

      const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
      if (!templateMatch) {
        console.log('No <template> found in', id);
        return;
      }

      const templateContent = templateMatch[1];
      const dataAttrValue = generateUniqueDataAttr(id);
      const dataAttr = `data-scopedcss-${dataAttrValue}`;

      const { modifiedTemplate, styles } = processTemplateAST(
        templateContent,
        dataAttr,
      );
      if (styles) {
        const rewrittenStyle = rewriteSelectors(styles, dataAttrValue);
        styleRegistry.set(id, rewrittenStyle); // Store styles per file
      }

      const newTemplate = `<template>${modifiedTemplate}</template>`;
      const newCode = code.replace(
        /<template>[\s\S]*?<\/template>/,
        newTemplate,
      );

      return { code: newCode };
    },

    transformIndexHtml(html) {
      // Combine all collected styles from the registry
      const allStyles = Array.from(styleRegistry.values()).join('\n');
      if (allStyles) {
        return html.replace('</head>', `<style>${allStyles}</style></head>`);
      }
      return html;
    },

    // Optional: Handle HMR updates in dev mode
    handleHotUpdate({ file }) {
      if (file.endsWith('.gts')) {
        // Ensure styles are reprocessed on update; Vite will re-run transform
        console.log('Hot update for:', file);
      }
    },
  };
}
