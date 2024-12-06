import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const babelPlugins = [['babel-plugin-react-compiler', {}]];
  if (command === 'serve') {
    babelPlugins.push(['@babel/plugin-transform-react-jsx-development', {}]);
  }

  return {
    base: '/terrain-experiment/',
    plugins: [react({ babel: { plugins: babelPlugins } })],
  };
});
