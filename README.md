# Silex Puter Plugin

The **Silex Puter Plugin** brings Silex’s professional website-building capabilities to the Puter environment, letting users create, save, and publish static websites directly in Puter. This plugin enables seamless integration, making it easier than ever to use Silex within Puter for web design and content management.

Here is [the code of a Silex instance using this plugin](https://github.com/silexlabs/puter.silex.me) and [the instance is available on puter.silex.me](https://puter.silex.me)

Check [Silex developer docs if you need help on seting up Silex to use this plugin](https://docs.silex.me/en/dev) or [join the discussions in the forum](https://community.silex.me/)

[🌐 **Try Silex on Puter**](https://puter.silex.me) – Fully integrated and ready for your next website project!

Features / TODO:

* [x] Open / save website to / from puter file system
* [x] Publish website to puter hosting
* [x] Upload assets to puter
* [ ] Test and debug
* [ ] Docs
* [ ] Write tests

## Installation

This is how to use the silex-puter plugin in your Silex instance or JS project

Add as a dependency

```bash
$ npm i --save @silexlabs/silex-puter
```

Add to Silex config (client or server)

```js
import plugin from '@silexlabs/silex-puter'
// Or import YourPlugin from '../path/to/silex-puter'
// Or import YourPlugin from 'http://unpkg.com/your-plugin'
export default function(config, options) {
  config.addPlugin(plugin, {
    // ... plugin config ...
  })
};
```

## Options

|Option|Description|Default|
|-|-|-
|`option1`|Description option|`default value`|

## Development

Clone the repository

```sh
$ git clone https://github.com/silexlabs/silex-puter.git
$ cd silex-puter
```

Install dependencies

```sh
$ npm i
```

Build and watch for changes

```sh
$ npm run build:watch
```

Start the dev server on port 3000 with watch and debug

```sh
$ npm run dev
```

Publish a new version

```sh
$ npm test
$ npm run lint:fix
$ git commit -am "new feature"
$ npm version patch
$ git push origin main --follow-tags
```

## License

AGPL-3.0
