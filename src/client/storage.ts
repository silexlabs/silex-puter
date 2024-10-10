import { getWebsite, saveWebsite } from './puter'
//import { WebsiteData } from '@silexlabs/silex/src/types'

export default function(config) {
  config.grapesJsConfig.storageManager.type = 'puter'
  config.grapesJsConfig.plugins.unshift(plugin)
}

export function validateId(id) {
  if (!id) {
    // throw new Error('Missing id in the URL')
    // Workaround: id should be set to ?id= or 'default'
    // throw new Error('No id')
    return new URL(location.href).searchParams.get('id')
  }
  return id
}

function plugin(editor) {
  editor.Storage.add('puter', {
    async load({ id }): Promise<any> {
      return getWebsite(validateId(id))
    },
    async store(data: any, { id }): Promise<void> {
      return saveWebsite(validateId(id), data)
    },
  })
}