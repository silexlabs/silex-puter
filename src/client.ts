import dashboard, { OPEN } from './client/dashboard'
import { init } from './client/puter'

export default function (config/*, options*/) {
  config.on('silex:startup:end', () => {
    dashboard(config.getEditor())
    // <script src="https://js.puter.com/v2/"></script>
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    document.head.appendChild(script)
    script.onload = () => {
      const editor = config.getEditor()
      console.log('puter loaded', { editor })
      setTimeout(() => start(editor))
    }
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
}
