declare const puter: any

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

export const UPDATE_EVENT = 'website:update'
function dispatchUpdate(options) {
  if(!editor) {
    throw new Error('editor not set in puter.ts')
  }
  editor.trigger(UPDATE_EVENT, options)
}

function waitForPuter() {
  return new Promise<void>((resolve) => {
    if(typeof puter !== 'undefined') {
      resolve()
      return
    }
    const interval = setInterval(() => {
      if(typeof puter !== 'undefined') {
        clearInterval(interval)
        resolve()
      }
    }, 1000)
  })
}

function blobToString(blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = function() {
      resolve(reader.result as string)
    }

    reader.onerror = function() {
      reject(new Error('Error reading the Blob as a string'))
    }

    reader.readAsText(blob)
  })
}

export async function init(_editor) {
  await waitForPuter()
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
  await waitForPuter()
  const files = await puter.fs.readdir(SILEX_DIR)
  return files.map(({ name }) => name)
  //const folders = await puter.fs.readdir(SILEX_DIR)
  //const websites = (await Promise.all(
  //  folders
  //  .map(name => `${SILEX_DIR}/${name}/${META_JSON}`)
  //  .map(async path => await puter.fs.read(path))
  //))
  //.map(content => JSON.parse(content))
  //return websites
}

export async function getWebsite(name) {
  await waitForPuter()
  const path = `${SILEX_DIR}/${name}/${WEBSITE_JSON}`
  const content = await puter.fs.read(path)
  return JSON.parse(await blobToString(content))
}

export async function saveWebsite(name, website) {
  await waitForPuter()
  const path = `${SILEX_DIR}/${name}/${WEBSITE_JSON}`
  await puter.fs.write(path, JSON.stringify(website, null, 2))
  dispatchUpdate({ name, website })
}

export async function createWebsite(name) {
  await waitForPuter()
  await puter.fs.mkdir(`${SILEX_DIR}/${name}`)
  await saveWebsite(name, EMPTY_WEBSITE)
  dispatchUpdate({ name, website: EMPTY_WEBSITE })
}

export async function deleteWebsite(name) {
  await waitForPuter()
  confirm('Are you sure you want to delete this website?')
  if(!confirm) return
  await puter.fs.delete(`${SILEX_DIR}/${name}`)
  dispatchUpdate({ name })
}

export async function renameWebsite(oldName, newName) {
  await waitForPuter()
  await puter.fs.rename(`${SILEX_DIR}/${oldName}`, newName)
  dispatchUpdate({ name: newName })
}
