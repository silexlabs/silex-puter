import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/server.ts',
  output: {
    file: 'dist/server.js',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['@silexlabs/silex'],
  plugins: [
    // Removed eslint because it breaks the build in npm workspace mode
    //eslint({
    //  fix: true,
    //  include: ['src/server/**/*.ts', 'src/server.ts'],
    //}), // Linting
    typescript({
      include: ['src/server/**/*.ts', 'src/server.ts'],
    }), // Supports typescript
    nodeResolve(), // Import modules from node_modules
    commonjs(), // Convert CommonJS modules to ES6 when importing node_modules
  ],
};

