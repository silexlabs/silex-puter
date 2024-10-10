import { PuterError, uploadFile } from './puter'

export default function(config) {
  config.grapesJsConfig.assetManager.uploadFile = async (e) => {
    const editor = config.getEditor()
    const inputElement = e.target as HTMLInputElement
    if(inputElement.files?.length) {
      editor.trigger('asset:upload:start')
      try {
        const result = await uploadFile(config.id, inputElement.files)
        const paths = result as string[]
        const { code, message } = result as PuterError
        if(code && message) {
          throw new Error(message)
        }
        editor.trigger('asset:upload:end')
        paths.forEach(path => {
          editor.trigger('asset:add', {
            src: path,
          })
          editor.AssetManager.add({ src: path })
        })
      } catch (error) {
        console.error('error', error)
        editor.trigger('asset:upload:error', error)
        editor.trigger('asset:upload:end')
      }
    }
  }
}