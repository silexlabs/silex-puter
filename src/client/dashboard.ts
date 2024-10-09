/**
 * @fileoverview
 * A grapesjs dialog which displays a list of all the websites the user has created.
 * The user can create a website, select one to edit it, rename, or delete.
 */

import { html, render } from 'lit-html'
import { createWebsite, deleteWebsite, getWebsites, renameWebsite, UPDATE_EVENT } from './puter'

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
      console.log('dashboard:open', { websites })
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
  console.log('renderDialog', { websites })
  return html`
    <style>
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      background-color: #2c2c2e; /* Dark background for the list */
      border-radius: 8px;
      overflow: hidden;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #444;
      color: #fff; /* Text color */
    }

    li a {
      color: #97ccf8; /* Accent color for links */
      text-decoration: none;
    }

    li a:hover {
      text-decoration: underline;
    }

    button {
      background-color: #3c3a43; /* Button background */
      border: none;
      color: #fff; /* Button text color */
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #4d5974; /* Button hover background */
    }

    button:focus {
      outline: none;
      box-shadow: 0 0 0 2px #97ccf8; /* Focus outline */
    }

    li:last-child {
      border-bottom: none;
    }

    ul button {
      margin-left: 10px;
    }

    button.create {
      background-color: #66a9e1;
      padding: 10px 15px;
      width: 100%;
      border-radius: 0 0 8px 8px;
      font-weight: bold;
    }

    button.create:hover {
      background-color: #3c3a43;
    }
    </style>
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
