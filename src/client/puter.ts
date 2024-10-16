declare const puter: any
export type PuterError = { code: number, message: string }

const SILEX_DIR = './silex'
const WEBSITE_JSON = 'website.json'
const EMPTY_WEBSITE = {}

export default function (config) {
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
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()
    init(editor)
  })
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


function getReader(blob, resolve, reject) {
  const reader = new FileReader()

  reader.onload = function () {
    resolve(reader.result as string)
  }

  reader.onerror = function () {
    reject(new Error('Error reading the Blob as a data URL'))
  }

  return reader
}

export async function blobToDataUrl(blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = getReader(blob, resolve, reject)
    reader.readAsDataURL(blob)
  })
}

export async function blobToString(blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = getReader(blob, resolve, reject)
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
  if(!name) {
    return EMPTY_WEBSITE
  }
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
  if(!name) return
  await puter.fs.mkdir(`${SILEX_DIR}/${name}`)
  await puter.fs.mkdir(`${SILEX_DIR}/${name}/assets`)
  await saveWebsite(name, EMPTY_WEBSITE)
  dispatchUpdate({ name, website: EMPTY_WEBSITE })
}

export async function deleteWebsite(name) {
  await waitForPuter()
  const stop = !confirm('Are you sure you want to delete this website?')
  if(stop) return
  await puter.fs.delete(`${SILEX_DIR}/${name}`)
  dispatchUpdate({ name })
}

export async function renameWebsite(oldName, newName) {
  await waitForPuter()
  if(!newName || newName === oldName) return
  await puter.fs.rename(`${SILEX_DIR}/${oldName}`, newName)
  dispatchUpdate({ name: newName })
}

export async function uploadFile(name, files: FileList/* | File[] | Blob[]*/): Promise<string[] | PuterError> {
  await waitForPuter()
  await puter.fs.upload(files, `${SILEX_DIR}/${name}/assets`)
  return Array.from(files).map(file => `/assets/${file.name}`)
}

export async function downloadFile(name, path) {
  await waitForPuter()
  return puter.fs.read(`${SILEX_DIR}/${name}${path}`)
}

export async function publishWebsite(name, hostingPath, data) {
  await waitForPuter()
  try {
    await Promise.all([
      puter.fs.mkdir(`${hostingPath}/assets`),
      puter.fs.mkdir(`${hostingPath}/css`),
    ])
  } catch (error) {
    if (error.code !== 'item_with_same_name_exists') {
      console.error('error', error)
    }
  }
  return Promise.all(data.files.map(async file => {
    if(file.content) {
      const path = `${hostingPath}${file.path}`
      await puter.fs.write(path, file.content)
    } else if(file.src) {
      const src = `${SILEX_DIR}/${name}/assets/${file.src}`
      const path = `${hostingPath}/assets`
      await puter.fs.copy(src, path, { overwrite: true })
    }
  }))
}

export async function hostingList() {
  await waitForPuter()
  return puter.hosting.list()
}

export async function hostingCreate() {
  await waitForPuter()
  const  defaultName = puter.randName()
  const name = prompt('Enter the name of the hosting', defaultName)
  if(!name) return
  await puter.fs.mkdir(name)
  const subdomain = name
  return await puter.hosting.create(subdomain, name)
}
