const CompileTsServiceWorker = () => ({
    name: 'compile-typescript-service-worker',
    async writeBundle(_options, _outputBundle) {
      const inputOptions: InputOptions = {
        input: 'src/sw-custom.ts',
        plugins: [rollupPluginTypescript(), nodeResolve()],
      }
      const outputOptions: OutputOptions = {
        file: 'dist/sw-custom.js',
        format: 'es',
      }
      const bundle = await rollup(inputOptions)
      await bundle.write(outputOptions)
      await bundle.close()
    }
  })
