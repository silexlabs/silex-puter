declare const puter: any

export const UPDATE_EVENT = 'website:update'
function dispatchUpdate(options) {
  if(!editor) {
    throw new Error('editor not set in puter.ts')
  }
  editor.trigger(UPDATE_EVENT, options)
}

const SILEX_DIR = './silex'
const WEBSITE_JSON = 'website.json'
const EMPTY_WEBSITE = {
  //pages: [],
  //components: [],
  //styles: [],
  //fonts: [],
  //settings: {
  //  title: 'New website',
  //  description: '',
  //  keywords: '',
  //},
}

let editor
export async function init(_editor) {
  editor = _editor
  try {
    await puter.fs.mkdir(SILEX_DIR)
  } catch (error) {
    if(error.code !== 'item_with_same_name_exists') {
      console.error('error', error)
    }
  }
}

export async function getWebsites() {
  const files = await puter.fs.readdir(SILEX_DIR)
  return files.map(({ name }) => name)
  //const folders = await puter.fs.readdir(SILEX_DIR)
  //const websites = (await Promise.all(
  //  folders
  //  .map(name => `${SILEX_DIR}/${name}/${META_JSON}`)
  //  .map(async path => await puter.fs.readFile(path))
  //))
  //.map(content => JSON.parse(content))
  //return websites
}

export async function getWebsite(name) {
  const path = `${SILEX_DIR}/${name}/${WEBSITE_JSON}`
  const content = await puter.fs.readFile(path)
  return JSON.parse(content)
}

export async function saveWebsite(name, website) {
  const path = `${SILEX_DIR}/${name}/${WEBSITE_JSON}`
  await puter.fs.write(path, JSON.stringify(website, null, 2))
  dispatchUpdate({ name, website })
}

export async function createWebsite(name) {
  await puter.fs.mkdir(`${SILEX_DIR}/${name}`)
  await saveWebsite(name, EMPTY_WEBSITE)
  dispatchUpdate({ name, website: EMPTY_WEBSITE })
}

export async function deleteWebsite(name) {
  confirm('Are you sure you want to delete this website?')
  if(!confirm) return
  console.log('deleteWebsite', { name })
  await puter.fs.delete(`${SILEX_DIR}/${name}`)
  dispatchUpdate({ name })
}

export async function renameWebsite(oldName, newName) {
  await puter.fs.rename(`${SILEX_DIR}/${oldName}`, newName)
  dispatchUpdate({ name: newName })
}
