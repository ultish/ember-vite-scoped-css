import { preprocess, print, traverse, builders } from '@glimmer/syntax';
import postcss from 'postcss';
import { createHash } from 'crypto';

let collectedStyles = '';

/**
 * Generates a unique data attribute value based on the file's ID (path).
 * @param {string} id - The file path or identifier.
 * @returns {string} - A unique data attribute value, e.g., "d0671e3186-6820d9adf9".
 */
function generateUniqueDataAttr(id) {
  const hash = createHash('md5').update(id).digest('hex');
  return `${hash.slice(0, 10)}-${hash.slice(10, 20)}`;
}

/**
 * Rewrites CSS selectors to use a data attribute selector for all elements.
 * @param {string} css - The CSS content to rewrite.
 * @param {string} dataAttrValue - The unique data attribute value to use.
 * @returns {string} - The rewritten CSS.
 */
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

/**
 * Processes the template AST to remove styles and add data attributes.
 * @param {string} templateContent - The raw template string.
 * @param {string} dataAttr - The data attribute to add (e.g., "data-scopedcss-d0671e3186-6820d9adf9").
 * @returns {Object} - { modifiedTemplate: string, styles: string }
 */
function processTemplateAST(templateContent, dataAttr) {
  // Parse the template into an AST using preprocess
  const ast = preprocess(templateContent);
  let styleContent = '';

  // Traverse the AST to find and remove <style scoped> and collect its content
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
        // Replace the style node with an empty node or remove it
        return builders.text(''); // Replace with empty text to remove it
      }
    },
  });

  // Traverse the AST again to add the data attribute to all HTML elements
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

  // Serialize the modified AST back to a string
  const modifiedTemplate = print(ast).trim();

  return { modifiedTemplate, styles: styleContent };
}

export default function scopedStylesPlugin() {
  return {
    name: 'scoped-styles',
    enforce: 'pre',

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
      if (!styles) {
        console.log('No styles extracted from', id);
        return;
      }

      const rewrittenStyle = rewriteSelectors(styles, dataAttrValue);
      collectedStyles += rewrittenStyle + '\n';

      const newTemplate = `<template>${modifiedTemplate}</template>`;
      const newCode = code.replace(
        /<template>[\s\S]*?<\/template>/,
        newTemplate,
      );

      return newCode;
    },

    transformIndexHtml(html) {
      if (collectedStyles) {
        return html.replace(
          '</head>',
          `<style>${collectedStyles}</style></head>`,
        );
      }
      return html;
    },
  };
}
