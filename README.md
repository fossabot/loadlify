# Loadlify
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmrvik%2Floadlify.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmrvik%2Floadlify?ref=badge_shield)


Fully customizable and simpe loader for web assets with support for ES6 modules


## Basic usage

The function `load`, declared in the global scope is a shorthand for `loadlify.load`
This function has two arguments, one is mandatory:
````javascript
	load(script, flags);
	//The first argument can be an array or a string
	//The second argument must be an array or undefined. This flags are inherited by default, but can be disabled
	//The return is a promise and it's value is an array as defined below
````

#### Return value
The return value is like this:

````javascript
	{
		apply:[
			constructedFunction(javascript)|textOfAsset(any other handler),
			{
				err: undefined|errorString,
				flags: [flags used],
				rv: return value from function (undefined is the most common),
				url: url string from where the asset was loaded
			}
		],
		deps:[dependencies loading object (the same structure)]
	}
````
#### Examples

- Load it with script tags
	````html
		<!-- Minified version -->
		<script src="https://unpkg.com/loadlify@latest/loadlify.min.js"></script>
		<!-- Normal version -->
		<script src="https://unpkg.com/loadlify@latest/loadlify.js"></script>
	 ````
  - Alternatively, you can use `eval()` or the `Function()` constructor
- Now, the `load` function, the `loadlify` object and the `loadlifyJS` class have jumped to the global scope
- To load an asset, just:
	````javascript
		load("bootstrap").then(a=>{
			//Code with bootstrap and jQuery (jQuery is loaded as a dependency of bootstrap)
		});
		load(["your/library.js", "your/library.css"]).then(a=>{
			//When loading libraries this way, the loader takes loadlify.props.prefix as a prefix for your path. It defauts to ./lib/
		});
		load("https://unpkg.com/vue@latest/vue.min.js").then(a=>{
			//When loading libraries this way, loadlify automatically fetches the URL
		});
	````

## In-Depth Usage

#### Inside
The `load` method has control over the load process. It loads the asset and calls the handler
`load` is an alias of `loadlify.load`
- 1: `loadlify.load` can only handle strings, so first of all, we must make a pool with loadlify objects
- 2: `loadlify.load` resolves the URL of the resource
- 3: `loadlify.load` makes a query to the cache for the URL. If cache has it, returns the cache response
- 4: `loadlify.load` checks the dependencies of the resource and waits them to load
- 5: `loadlify.load` fetches the URL and rejects the Promise in case of error
- 6: `loadlify.load` checks for the type of resource or any flags indicating it
- 7: `loadlify.handlers` executes a function in order to load the asset into the page
- 8: `loadlify.load` inserts the load object on the cache and returns it. Promise is fired

#### The `loadlify` object
- Use `loadlify.load(asset)` function to load assets
  - You can modify defs, deps and other variables on the run.
  - `load()` function supports flags. `load(asset, [flags])`
    - Flags are inherited so dependencies will load with the same flags as the main asset
    - `noflagsindeps` dependencies won't inherit flags from the parent asset
    - `nodeps` won't load dependencies
    - `nocache` loader Cache won't be checked (loader can't control ServiceWorker or other cache types. Loader won't check *it's own* cache)
    - `force` will load the asset ignoring the warnings and cache (loadlify cache)
    - `astag` will load the script in a `<script>` tag (CSS is always loaded in a `<style>` tag)
    - `noprefix` won't add the prefix (defined at `properties` object on when constructing and at `props` object in the constructed function) to the URL
    - `requirejs` Only JavaScript. Will put requireJS before the script

#### The `loadlifyJS` class

- `loadlifyJS` variable contains the constructor. Customize your loader by constucting the class
- `loadlifyJS` will take from the object in the first parameter the config values. The not supplied variables, will be taken from defults
	
````javascript
var loader=new loadlifyJS({
	defs: yourOwnDefinitions,
	deps: yourOwnScriptDependencies,
	flags: yourDefaultFlags,
	properties: yourOwnProperties
});
````


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmrvik%2Floadlify.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmrvik%2Floadlify?ref=badge_large)