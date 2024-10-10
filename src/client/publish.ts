import { html } from 'lit-html'
import { hostingCreate, hostingList, publishWebsite } from './puter'

const BASIC_STYLES = `
  #publish-dialog main {
    .silex-button {
      background-color: #3c3a43;
      border: none;
      color: #fff;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .silex-button--small {
      padding: 4px 8px;
      font-size: .8em;
      width: auto;
      margin: auto;
      display: block;
    }
    .silex-button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 1em;
      & > * {
        margin: 5px;
      }
    }
    h3 {
      margin: 1em 0;
    }
  }
`

function setConnectorId(connectorId, publicationManagerOrUi, editor) {
  const settings = editor.getModel().get('settings')
  publicationManagerOrUi.settings = {
    ...settings,
    connector: {
      ...settings.connector,
      connectorId,
    },
  }
  editor.getModel().set({
    settings: {
      ...settings,
      connector: {
        ...settings.connector,
        connectorId,
      },
    }
  })
}

export default function(config) {
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()
    editor.on('silex:publication-ui:open', async ({publicationUi}) => {
      publicationUi.renderDialog(null, 'STATUS_NONE')
    })
    editor.on('silex:publish:data', async ({ data, preventDefault, publicationManager }) => {
      preventDefault()
      publicationManager.status = 'STATUS_SUCCESS'
      try {
        const folder = await getPublicationFolder(editor, publicationManager)
        await publishWebsite(config.id, folder, data)
        const id = publicationManager.dialog.settings?.connector?.connectorId
        const url = `https://${id}.puter.site`
        publicationManager.status = 'STATUS_SUCCESS'
        publicationManager.dialog.setUserContent(html`
          <div>
            <style>
              ${ BASIC_STYLES }
            </style>
            <h3>Success</h3>
            <p>Website published successfully</p>
          </div>
          <div class="silex-button-group">
            <button
              class="silex-button"
              @click=${() => {
    publicationManager.status = 'STATUS_NONE'
    publicationManager.dialog.status = 'STATUS_NONE'
    publicationManager.dialog.setUserContent(null)
    publicationManager.dialog.renderDialog(null, 'STATUS_NONE')
  }}
            >Back</button>
            <button
              class="silex-button silex-button--primary"
              @click=${() => {
    window.open(url, '_blank')
  }}
            >Open</button>
          </div>
        `)
        publicationManager.dialog.renderDialog(null, 'STATUS_SUCCESS')
      } catch(err) {
        publicationManager.status = 'STATUS_ERROR'
        publicationManager.dialog.setUserContent(html`
          <style>
            ${ BASIC_STYLES }
          </style>
          <div>
            <h3>Error <pre>${err.code}</pre></h3>
            <hr>
            <p>${err.message}</p>
            <button
              class="silex-button silex-button--primary"
              focus
              @click=${() => {
    publicationManager.status = 'STATUS_NONE'
    publicationManager.dialog.status = 'STATUS_NONE'
    publicationManager.dialog.setUserContent(null)
    publicationManager.dialog.renderDialog(null, 'STATUS_NONE')
  }}>Back</button>
          </div>
        `)
        publicationManager.dialog.renderDialog(null, 'STATUS_ERROR')
      }
    })
  })
}

async function getPublicationFolder(editor, publicationManager): Promise<string> {
  let action: ((folder: string) => void) | null = null
  function waitForaction(resolve: (folder: string) => void) {
    action = resolve
  }
  function doAction(folder: string) {
    if (action) action(folder)
    action = null
  }

  renderDialog(doAction, editor, publicationManager)

  return new Promise(resolve => {
    waitForaction(resolve)
  })
}

let status = 'STATUS_SUCCESS'
async function renderDialog(resolve: (folder: string) => void, editor, publicationManager): Promise<any> {
  const dialog = publicationManager.dialog
  // Loading
  dialog.setUserContent(html`
    <div>
      <p>Loading...</p>
    </div>
  `)
  dialog.renderDialog(null, status)
  // List
  const list = await hostingList()
  const id = dialog.settings?.connector?.connectorId
  // UI
  dialog.setUserContent(html`
    <div>
      <style>
        ${ BASIC_STYLES }
        #publish-dialog main .publish-list {
          list-style: none;
          padding: 0;
          li {
            margin: 0.5em;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            color: #fff;
            &.active {
              button {
                background-color: #444;
                border: 1px solid #a291ff;
              }
            }
          }
        }
      </style>
      <p>Where you want to publish the website?</p>
      <ul class="publish-list">
        ${list.map(item => html`
          <li
            data-id="${item.id}"
            class="${id === item.subdomain ? 'active' : ''}"
          >
            <button
              class="silex-button"
              @click=${() => {
    setConnectorId(item.subdomain, dialog, editor)
    resolve(item.root_dir.path)
  }}>
              ${item.subdomain}
            </button>
          </li>
        `)}
      </ul>
      <div class="silex-button-group">
        <button
          class="silex-button"
          @click=${async () => {
    try {
      await createHosting()
    } catch(err) {
      status = 'STATUS_ERROR'
      dialog.setUserContent(html`
              <div>
                <h3>Error</h3>
                <p>${err}</p>
                <button
                  class="silex-button silex-button--primary"
                  @click=${() => {
    publicationManager.status = 'STATUS_NONE'
    dialog.status = 'STATUS_NONE'
    dialog.setUserContent(null)
    dialog.renderDialog(null, 'STATUS_NONE')
  }}>Back</button>
              </div>
            `)
    }
    renderDialog(resolve, editor, publicationManager)
  }}
        title="Create a new hosting"
        >+ Create Hosting</button>
        ${ !!id && id !== 'fs-hosting' ? html`
          <button
            class="silex-button silex-button--primary"
            @click=${() => {
    resolve(id)
  }}
            title="Next"
          >Next</button>
        ` : ''}
      </div>
    </div>
  `)
  dialog.renderDialog(null, status)
}

async function createHosting() {
  return hostingCreate()
}