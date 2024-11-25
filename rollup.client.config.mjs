import typescript from '@rollup/plugin-typescript';
import eslint from '@rollup/plugin-eslint';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/client.ts',
  output: {
    file: 'dist/client.js',
    format: 'es',
    sourcemap: true,
  },
  external: ['@silexlabs/silex'],
  plugins: [
    eslint({
      fix: true,
      include: ['src/client/**/*.ts', 'src/client.ts'],
    }), // Linting
    typescript({
      include: ['src/client/**/*.ts', 'src/client.ts'],
    }),
    nodeResolve(), // Import modules from node_modules
    commonjs(), // Convert CommonJS modules to ES6 when importing node_modules
  ],
};
