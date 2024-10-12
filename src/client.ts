import dashboard, { OPEN } from './client/dashboard'
import { init } from './client/puter'
import storage from './client/storage'
import assets from './client/assets'
import publish from './client/publish'

export default function (config/*, options*/) {
  // Get id from the query string
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')
  if(id) {
    config.id = id
  }
  config.on('silex:grapesjs:start', () => {
    storage(config)
    assets(config)
    publish(config)
  })
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()
    dashboard(editor, config)
    setTimeout(() => start(config, editor))
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

async function start(config, editor) {
  await init(editor)
  if(!config.id) {
    editor.runCommand(OPEN)
  }
  // Workaround: This should already be the default
  editor.StorageManager.setAutosave(true)
}
