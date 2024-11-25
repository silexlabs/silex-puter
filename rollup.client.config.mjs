import typescript from '@rollup/plugin-typescript';
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
    // Removed eslint because it breaks the build in npm workspace mode
    //eslint({
    //  fix: true,
    //  include: ['src/client/**/*.ts', 'src/client.ts'],
    //}), // Linting
    typescript({
      include: ['src/client/**/*.ts', 'src/client.ts'],
    }),
    nodeResolve(), // Import modules from node_modules
    commonjs(), // Convert CommonJS modules to ES6 when importing node_modules
  ],
};
