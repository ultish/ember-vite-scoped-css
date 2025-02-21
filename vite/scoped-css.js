import postcss from 'postcss';
import { createHash } from 'crypto';

let collectedStyles = '';

/**
 * Generates a unique class name based on the file's ID (path).
 * @param {string} id - The file path or identifier.
 * @returns {string} - A unique class name, e.g., "_2hf4s".
 */
function generateUniqueClass(id) {
  const hash = createHash('md5').update(id).digest('hex').slice(0, 6);
  return `_${hash}`;
}

/**
 * Rewrites CSS selectors to prefix them with the unique class.
 * @param {string} css - The CSS content to rewrite.
 * @param {string} className - The unique class to use as a prefix.
 * @returns {string} - The rewritten CSS.
 */
function rewriteSelectors(css, className) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    rule.selectors = rule.selectors.map(
      (selector) => `${selector}.${className}`,
    );
  });
  return root.toString();
}

export default function scopedStylesPlugin() {
  return {
    name: 'scoped-styles',
    enforce: 'pre', // Run before Ember's transformation

    /**
     * Transform hook to process GTS files.
     */
    transform(code, id) {
      if (!id.endsWith('.gts')) return;

      // Extract <template> content
      const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
      if (!templateMatch) {
        console.log('No <template> found in', id);
        return;
      }

      const templateContent = templateMatch[1];

      // Extract <style scoped> content
      const styleMatch = templateContent.match(
        /<style scoped>([\s\S]*?)<\/style>/,
      );
      if (!styleMatch) {
        console.log('No <style scoped> found in', id);
        return;
      }

      const style = styleMatch[1];
      const uniqueClass = generateUniqueClass(id);

      // Rewrite the styles with the unique class
      const rewrittenStyle = rewriteSelectors(style, uniqueClass);
      collectedStyles += rewrittenStyle + '\n';

      // Remove <style> tag from template
      let templateWithoutStyle = templateContent
        .replace(/<style scoped>[\s\S]*?<\/style>/, '')
        .trim();

      // Add unique class as an attribute inside root-level <div> tags
      templateWithoutStyle = templateWithoutStyle.replace(
        /^(\s*<div\b)([^>]*>)/gm, // Capture <div and its attributes separately
        `$1 class="${uniqueClass}"$2`, // Insert class attribute before the closing >
      );

      // Rebuild the template
      const newTemplate = `<template>${templateWithoutStyle}</template>`;
      const newCode = code.replace(
        /<template>[\s\S]*?<\/template>/,
        newTemplate,
      );

      return newCode;
    },

    /**
     * Inject collected styles into the HTML <head>.
     */
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
