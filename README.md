# Loadlify

Fully customizable and simpe loader for web assets like JS, CSS or HTML

## Usage
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
	
