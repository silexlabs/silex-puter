import { getWebsite, saveWebsite } from './puter'
//import { WebsiteData } from '@silexlabs/silex/src/types'

export default function(config) {
  config.grapesJsConfig.storageManager.type = 'puter'
  config.grapesJsConfig.plugins.unshift(plugin)
}

export function validateId(editor, id) {
  if (!id) {
    // throw new Error('Missing id in the URL')
    // Workaround: id should be set to ?id= or 'default'
    // throw new Error('No id')
    const getId = new URL(location.href).searchParams.get('id')
    if(getId) {
      return getId
    }
    const configId = editor.getModel().config?.websiteId
    if(configId) {
      return configId
    }
  }
  return id
}

function plugin(editor) {
  editor.Storage.add('puter', {
    async load({ id }): Promise<any> {
      return getWebsite(validateId(editor, id))
    },
    async store(data: any, { id }): Promise<void> {
      return saveWebsite(validateId(editor, id), data)
    },
  })
}