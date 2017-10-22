# Loadlify

Fully customizable and simpe loader for web assets.


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
To load an asset, just:
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
- Load it
- `loadlify` variable contains the constructed class
  - Use `loadlify.load(asset)` function to load assets. Don't call stage functions `stX()` directly, `load` will prepare everything and call them automatically.
  - You can modify defs, deps and other variables on the run.
  - `load()` function supports flags. `load(asset, [flags])`
    - Flags are inherited so dependencies will load with the same flags as the main asset
    - `nodeps` won't load deps
    - `nocache` loader Cache won't be checked (loader can't control ServiceWorker or other cache types. Loader won't check *it's* cache)
    - `force` will load the asset without following any advice.
    - `nojquery` won't load jquery if `$` is not defined. (Most navigators include a vanilla `$` function that does the work)
    - `astag` will load the script in a `<script>` tag (CSS is always loaded in a `<style>` tag)
    - `noprefix` won't add the prefix (defined at `properties` object on when constructing and at `props` object in the constructed function) to the URL
- `loadlifyJS` variable contains the full class. Make your own implementation with 
   ````javascript
    var loader=new loadlifyJS({
		defs: yourOwnDefinitions,
		deps: yourOwnScriptDependencies,
		flags: yourDefaultFlags,
		properties: yourOwnProperties
	});
	````
	
