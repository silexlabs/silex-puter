import { blobToDataUrl, downloadFile, PuterError, uploadFile } from './puter'

const LOADING_DATA_URL = 'data:image/svg+xml,%3Csvg style="opacity: 0.2;" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"%3E%3Cstyle%3E.spinner_P7sC%7Btransform-origin:center%3Banimation:spinner_svv2 .75s infinite linear%7D%40keyframes spinner_svv2%7B100%25%7Btransform:rotate(360deg)%7D%7D%3C/style%3E%3Cpath d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" class="spinner_P7sC"/%3E%3C/svg%3E'
const PUTER_PREVIEW_IMG_ID = 'data-putter-preview-img'

export default function(config) {
  config.on('silex:grapesjs:end', () => after(config))
  config.on('silex:grapesjs:start', () => before(config))
}

async function renderImage(image: HTMLImageElement, name: string, path: string, style = '') {
  // Display svg during loading
  // From https://github.com/HeyPuter/puter/blob/f0b7214a0788fd5b758dcd84a44b236b8f95981e/src/dev-center/img/loading.svg?plain=1#L2
  // <svg style="opacity: 0.2;" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_P7sC{transform-origin:center;animation:spinner_svv2 .75s infinite linear}@keyframes spinner_svv2{100%{transform:rotate(360deg)}}</style><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" class="spinner_P7sC"/></svg>
  image.setAttribute('src', LOADING_DATA_URL)
  image.style.minWidth = '100px'
  image.style.minHeight = '100px'
  image.style.objectFit = 'scale-down'

  // Download the file
  const fileContent = await downloadFile(name, path)

  // Convert the file to a data URL
  const dataUrl = await blobToDataUrl(fileContent)

  // Transition to the new image
  // image.style.opacity = '0'

  // Set the data URL as the image source
  image.setAttribute('src', dataUrl)
  
  // Set the final style
  image.setAttribute('style', style)

  // Transition to the new image
  //setTimeout(() => {
  //  image.style.transition = 'opacity 0.3s'
  //  setTimeout(() => {
  //    image.setAttribute('style', style)
  //  }, 300) // Length of the transition

  //  // Reset the styles to start the transition
  //  image.style.opacity = ''
  //}, 100) // Firefox needs a delay to apply the transition
}

function before(config) {
  config.grapesJsConfig.assetManager.uploadFile = async (e) => {
    const editor = config.getEditor()
    const inputElement = e.target as HTMLInputElement
    if (inputElement.files?.length) {
      editor.trigger('asset:upload:start')
      try {
        const result = await uploadFile(config.id, inputElement.files)
        const paths = result as string[]
        const { code, message } = result as PuterError
        if (code && message) {
          throw new Error(message)
        }
        editor.trigger('asset:upload:end')
        paths.forEach(path => {
          editor.trigger('asset:add', {
            src: path,
          })
          editor.AssetManager.add({ src: path, path })
        })
      } catch (error) {
        console.error('error', error)
        editor.trigger('asset:upload:error', error)
        editor.trigger('asset:upload:end')
      }
    }
  }
}

function after(config) {
  const editor = config.getEditor()
  // Extend the image component type with custom logic
  // Override how the asset is displayed, converting to data URL
  editor.DomComponents.addType('image', {
    view: {
      onRender() {
        const path = this.model.get('src')
        renderImage(this.el as HTMLImageElement, config.id, path)
        this.on('change', () => {
          renderImage(this.el as HTMLImageElement, config.id, path)
        })
      },
      onAttrUpdate() {
        const path = this.model.get('src')
        renderImage(this.el as HTMLImageElement, config.id, path)
      },
    },
    isComponent: el => el.tagName === 'IMG',
  })

  editor.AssetManager.addType('image', {
    view: {
      getPreview() {
        setTimeout(() => {
          const img = this.el.querySelector(`[${ PUTER_PREVIEW_IMG_ID }]`) as HTMLImageElement
          const path = this.model.get('src')
          const name = config.id
          renderImage(img, name, path, 'width: 100%; height: 100%; object-fit: scale-down;')
        })
        return `
          <img
            ${ PUTER_PREVIEW_IMG_ID }
            src="${LOADING_DATA_URL}" alt="${name}"
            />
        `
      },
      getInfo() {
        return this.model.getFilename()
      }
    }
  })
}