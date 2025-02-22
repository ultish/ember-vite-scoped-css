import { preprocess, print, traverse, builders } from '@glimmer/syntax';
import postcss from 'postcss';
import { createHash } from 'crypto';
import { Plugin } from 'vite';

interface ScopedStylesOptions {
  attributeName?: string;
  debug?: boolean;
}

function generateUniqueDataAttr(id: string): string {
  const hash = createHash('md5').update(id).digest('hex');
  return `${hash.slice(0, 10)}-${hash.slice(10, 20)}`;
}

function rewriteSelectors(css: string, dataAttrValue: string): string {
  const root = postcss.parse(css);
  root.walkRules(rule => {
    rule.selectors = rule.selectors.map(selector => {
      const match = selector.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
      if (match) {
        return `${match[0]}[data-scopedcss-${dataAttrValue}]`;
      }
      return `[data-scopedcss-${dataAttrValue}]${selector}`;
    });
  });
  return root.toString();
}

function processTemplateAST(templateContent: string, dataAttr: string): { modifiedTemplate: string; styles: string } {
  const ast = preprocess(templateContent);
  let styleContent = '';

  traverse(ast, {
    ElementNode(node) {
      if (node.tag === 'style' && node.attributes.some(attr => attr.name === 'scoped')) {
        styleContent = node.children
          .filter(child => child.type === 'TextNode')
          .map(child => child.chars)
          .join('');
        return builders.text('');
      }
    },
  });

  traverse(ast, {
    ElementNode(node) {
      if (!['style', 'script'].includes(node.tag.toLowerCase())) {
        const existingAttr = node.attributes.find(attr => attr.name === dataAttr);
        if (!existingAttr) {
          node.attributes.push(builders.attr(dataAttr, builders.text('')));
        }
      }
    },
  });

  const modifiedTemplate = print(ast).trim();
  return { modifiedTemplate, styles: styleContent };
}

export default function scopedStylesPlugin(options: ScopedStylesOptions = {}): Plugin {
  const { attributeName = 'data-scopedcss', debug = false } = options;
  const styleRegistry = new Map<string, string>();
  const cache = new Map<string, { code: string; styles: string }>();

  return {
    name: 'scoped-styles',
    enforce: 'pre',

    buildStart() {
      styleRegistry.clear();
      cache.clear();
    },

    async transform(code, id) {
      if (!id.endsWith('.gts')) return;

      const cacheKey = `${id}-${code.length}`;
      if (cache.has(cacheKey)) {
        const { code: cachedCode, styles } = cache.get(cacheKey)!;
        styleRegistry.set(id, styles);
        return { code: cachedCode };
      }

      try {
        const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
        if (!templateMatch) {
          if (debug) console.log('No <template> found in', id);
          return;
        }

        const templateContent = templateMatch[1];
        const dataAttrValue = generateUniqueDataAttr(id);
        const dataAttr = `${attributeName}-${dataAttrValue}`;

        const { modifiedTemplate, styles } = processTemplateAST(templateContent, dataAttr);
        const newTemplate = `<template>${modifiedTemplate}</template>`;
        const newCode = code.replace(/<template>[\s\S]*?<\/template>/, newTemplate);

        if (styles) {
          const rewrittenStyle = rewriteSelectors(styles, dataAttrValue);
          styleRegistry.set(id, rewrittenStyle);
          cache.set(cacheKey, { code: newCode, styles: rewrittenStyle });
        }

        return { code: newCode };
      } catch (error) {
        console.error(`Error processing ${id}:`, error);
        return { code }; // Fallback to original code
      }
    },

    transformIndexHtml(html) {
      const allStyles = Array.from(styleRegistry.values()).join('\n');
      if (allStyles) {
        return html.replace('</head>', `<style>${allStyles}</style></head>`);
      }
      return html;
    },
  };
}
