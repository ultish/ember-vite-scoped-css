import { preprocess, print, traverse, builders } from '@glimmer/syntax';
import postcss from 'postcss';
import { createHash } from 'crypto';

export default function rollupScopedStyles() {
  return {
    name: 'rollup-scoped-styles',
    transform(code, id) {
      if (!id.endsWith('.gts')) return null;

      console.log('FOUND CODE', id);
      console.log('CODE', code);

      const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
      if (!templateMatch) return null;

      console.log('TEMPLATE MATCH', templateMatch);

      const templateContent = templateMatch[1];
      const dataAttrValue = createHash('md5')
        .update(id)
        .digest('hex')
        .slice(0, 20);
      const dataAttr = `data-scopedcss-${dataAttrValue}`;

      const ast = preprocess(templateContent);
      let styles = '';

      traverse(ast, {
        ElementNode(node) {
          if (
            node.tag === 'style' &&
            node.attributes.some((attr) => attr.name === 'scoped')
          ) {
            styles = node.children.map((child) => child.chars).join('');
            return builders.text('');
          }
          node.attributes.push(builders.attr(dataAttr, builders.text('')));
        },
      });

      const newTemplate = `<template>${print(ast)}</template>`;
      const newCode = code.replace(
        /<template>[\s\S]*?<\/template>/,
        newTemplate,
      );

      const rewrittenStyle = postcss
        .parse(styles)
        .walkRules((rule) => {
          rule.selectors = rule.selectors.map((sel) => `${sel}[${dataAttr}]`);
        })
        .toString();

      // In a real Rollup plugin, you'd collect styles here and use generateBundle to output them
      console.log('Styles to inject:', rewrittenStyle);

      return { code: newCode };
    },
  };
}
