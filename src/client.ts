import puter from './client/puter'
import storage from './client/storage'
import assets from './client/assets'
import publish from './client/publish'
import dashboard from './client/dashboard'

export default function (config/*, options*/) {
  // Get id from the query string
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')
  if(id) {
    config.id = id
  }

  // Start all plugins from /client/*
  puter(config)
  storage(config)
  assets(config)
  publish(config)
  dashboard(config)

  // Workaround: autosave is not enabled by default?
  config.on('silex:grapesjs:end', () => {
    config.getEditor().StorageManager.setAutosave(true)
  })
}
