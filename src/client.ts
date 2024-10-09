import dashboard, { OPEN } from './client/dashboard'
import { init } from './client/puter'
import { updateConfig as updateConfigStorage } from './client/storage'
import { updateConfig as updateConfigAssets } from './client/assets'

export default function (config/*, options*/) {
  config.on('silex:grapesjs:start', () => {
    updateConfigStorage(config)
    updateConfigAssets(config)
  })
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()
    dashboard(editor)
    setTimeout(() => start(editor))
  })
  config.on('silex:startup:start', async () => {
    return new Promise<void>((resolve) => {
      // load <script src="https://js.puter.com/v2/"></script>
      const script = document.createElement('script')
      script.src = 'https://js.puter.com/v2/'
      document.head.appendChild(script)
      script.onload = () => {
        resolve()
      }
    })
  })
}

async function start(editor) {
  await init(editor)
  // Get id from the query string
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')
  if(!id) {
    editor.runCommand(OPEN)
  }
  // Workaround: This should already be the default
  editor.StorageManager.setAutosave(true)
}
