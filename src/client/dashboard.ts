/**
 * @fileoverview
 * A grapesjs dialog which displays a list of all the websites the user has created.
 * The user can create a website, select one to edit it, rename, or delete.
 */

import { html, render } from 'lit-html'
import { createWebsite, deleteWebsite, getWebsites, renameWebsite, UPDATE_EVENT } from './puter'
import styles from './dashboard-styles'

export const OPEN = 'dashboard:open'

export default function (editor) {
  // Keep track of the websites
  // Update the dialog when the websites are updated
  let websites = []
  let open = false
  function setWebsites(newWebsites) {
    websites = newWebsites
    if (open) doRenderDialog(editor, websites)
  }
  editor.on(UPDATE_EVENT, async ({ websites }) => {
    if(websites) {
      await setWebsites(websites)
    } else {
      await setWebsites(await getWebsites())
    }
  })

  editor.Commands.add(OPEN, {
    async run(editor) {
      open = true
      editor.Modal.open({
        title: 'Your websites',
      })
      await setWebsites(await getWebsites())
      doRenderDialog(editor, websites)
    },
    stop() {
      open = false
      editor.Modal.close()
    },
  })
}

function doRenderDialog(editor, websites) {
  const dialog = renderDialog(editor, websites)
  const el = document.createElement('div')
  render(dialog, el)
  editor.Modal.setContent(el)
}

function renderDialog(editor, websites) {
  return html`
    <style>${ styles }</style>
    <ul>
      ${websites.map(name => html`
        <li>
          <a href="/?id=${name}">${name}</a>
          <div>
            <button
              @click=${() => renameWebsite(name, prompt('New name', name))}
            >Rename</button>
            <button
              class="delete"
              @click=${() => deleteWebsite(name)}
            >Delete</button>
          </div>
        </li>
      `)}
    </ul>
    <button
      @click=${() => createWebsite(prompt('Name') || 'New website')}
      style="margin-top: 20px; background-color: #008CBA"
    >Create Website</button>
  `
}
