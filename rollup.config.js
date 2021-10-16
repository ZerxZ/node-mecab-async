import pkg from './package.json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
export default {
  input: 'src/index.ts',
  plugins: [typescript(), nodeResolve({ browser: false }), commonjs({ extensions: ['.js', '.ts'] })],
  external: Object.keys(pkg.dependencies).concat(['path', 'fs', 'typescript']),
  output: [

    {
      file: pkg.main,
      format: 'cjs',
      exports: 'auto',
      sourcemap: true
    }
  ]
}
