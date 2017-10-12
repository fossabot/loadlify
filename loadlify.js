"use-strict";
//LoadlifyJS Web Loader
class loadlifyJS{
	constructor(a){
		if(typeof XMLHttpRequest!="undefined") this.prefetch();
		this.defs=a.defs||defaults.defs;
		this.deps=a.deps||defaults.deps;
		this.loaded={};
		this.links={};
		this.flags=a.flags||defaults.flags;
		this.props=a.properties||defaults.properties;
		this.handlers={
			css: async function(a, b){
				let node=document.createElement("style");
				node.innerText=a.data;
				document.querySelector("head").appendChild(node);
				return [a.data, {flags: b, url: a.url}];
			},
			js: async function(a, b){
				if(b.includes("astag")){
					document.querySelector("head").appendChild("<script data-src='"+a.url+"'>"+a.data+"</script>");
					return [$("script[data-src='"+a.url+"']"), {flags: b,url:a.url}];
				}else{
					let c=new Function(a.data);
					let d=c();
					return [c, {rv:d,flags:b,url:a.url}];
				}
			},
			html: async function(a, b){
				return [a.data, {flags: b, url: a.url}];
			},
			plain: async function(a, b){
				return [a.data, {flags: b, url: a.url}];
			}
		};
	}
	get add(){
		let _this=this;
		let a={
			defs: function(_this, a){
				return _this.defs[a.key, a.value];
			},
			deps: function(_this, a){
				return _this.deps[a.key, a.value];
			}
		};
		return a;
	}
	prefetch(a){
		if(!a&&typeof fetch!="undefined")return this.pref=Promise.resolve();
		this.pref=new Promise(resolver=>{
			delete self.fetch;
			let x=new XMLHttpRequest();
			x.open("GET", defaults.defs.fetch, true);
			x.send();
			x.onloadend=a=>{
				new Function(a.target.response)();
				resolver(a);
			};
		});
	}
	async load(a, b){
		if(typeof a=="string"&&a.match("file://")) this.prefetch(true);
		await this.pref;
		if(typeof a=="undefined") return Promise.resolve();
		if(typeof b=="undefined") b=[];
		if(typeof a=="object"){
			let todo=[];
			a.forEach(c=>{
				todo.push(this.load(c, b));
			});
			await Promise.all(todo);
			return todo;
		}
		let loading={};
		loading["link"]=this.getlink(a, b);
		
		let cache=this.cachemgr(loading.link, b);
		if(cache) return Promise.resolve(cache); //If URL is in cache, return cached response
		
		if(!b.includes("nodeps")){
			loading["deps"]=await this.loadeps(a, b);
		}
		loading["text"]=await fetch(loading.link).then(x=>{
			if(x.ok)return x.text();
			return Promise.reject(x.statusText);
		});
		loading.type=this.whatIs(loading.link, b);
		loading.apply=await this.handlers[loading.type]({data: loading.text, url: loading.link},b);
		this.loaded[loading.link]=loading;
		return loading;
	}
	loadeps(a, b){
		if(this.deps.hasOwnProperty(a)){
			return this.load(this.deps[a]);
		}
		return Promise.resolve();
	}
	getlink(d, b){
		if(d.match(/^(((http|https|file):)|(\/\/))/)) return d;
		if(this.defs.hasOwnProperty(d)) return this.defs[d];
		if(b.includes("noprefix")) return new URL(d, location);
		return new URL(this.props.prefix+d, location);
	}
	cachemgr(a, b){
		if(b.includes("nocache")|| b.includes("force"))return undefined;
		if(Object.keys(this.loaded).includes(a))return this.loaded[a];
		return undefined;
	}
	whatIs(a, b){
		if(typeof a=="object" && 'href' in a) a=a.href;
		
		let reg=/(as)((css)|(js)|(font)|(html)|(plain))/;
		let res=b.filter(x=>x.match(reg));
		if(res[0]) return res[0].match(reg)[2];
		
		if(a.match(/(.*\.js)/)!=null&&a.match(/(.*\.js)/)[0]==a){
			return "js";
		}else if(a.match(/(.*\.css)/)!=null&&a.match(/(.*\.css)/)[0]==a){
			return "css";
		}else if(a.match(/(.*\.(html)|(htm))/)==a){
			return "html";
		}else if(a.match(/(.*fonts.*)/)){
			return "css"; //Fonts are loaded as css
		}else{
			console.warn("Unknown file: ", a);
			return "unknown";
		}
	}
	handlerctl(a){
		switch(a){
			case "set":
				return this.handlers[b]=c;
			case "remove":
				return delete this.handlers[b];
			default:
				return this.handlers;
		}
	}
	static optjQuery(){
		if(typeof jQuery == "undefined"){
			return "jQuery";
		}else{
			return undefined;
		}
	}
}
let defaults={
	defs:{
		jQuery: "https://unpkg.com/jquery@latest/dist/jquery.min.js",
		bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
		bootstrapCSS: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
		dexie: "https://unpkg.com/dexie@latest/dist/dexie.min.js",
		jqueryUI: "https://code.jquery.com/ui/1.12.1/jquery-ui.min.js",
		handlebars: "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js",
		jqueryUICSS: "https://code.jquery.com/ui/1.12.1/themes/ui-lightness/jquery-ui.css",
		fontAwesome: "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
		vex: "https://raw.githubusercontent.com/HubSpot/vex/master/dist/js/vex.combined.min.js",
		vexCSS: "https://raw.githubusercontent.com/HubSpot/vex/master/dist/css/vex.css",
		vexTheme: "https://raw.githubusercontent.com/HubSpot/vex/master/dist/css/vex-theme-plain.css",
		materializeCSS: "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/css/materialize.min.css",
		materialize: "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/js/materialize.min.js",
		materialIcons: "https://fonts.googleapis.com/icon?family=Material+Icons",
		["material-components-web"]: "https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css",
		["material-components-web-js"]: "https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js",
		socket_io: "https://unpkg.com/socket.io-client@latest/dist/socket.io.js",
		sha256: "https://unpkg.com/js-sha256@latest/build/sha256.min.js",
		AES: "https://cdn.rawgit.com/ricmoo/aes-js/master/index.js",
		lightgalleryCSS: "https://unpkg.com/lightgallery.js@1.0.1/dist/css/lightgallery.min.css",
		["lightgallery-transitions"]: "https://unpkg.com/lightgallery.js@1.0.1/dist/css/lg-transitions.min.css",
		lightgallery: "https://unpkg.com/lightgallery.js@1.0.1/dist/js/lightgallery.min.js",
		listJS: "//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js", //listJS no funciona con eval() https://github.com/javve/list.js/issues/528
		typedJS: "https://raw.githubusercontent.com/mattboldt/typed.js/master/lib/typed.min.js",
		openpgp: "https://unpkg.com/openpgp@latest/dist/openpgp.min.js",
		moment: "https://unpkg.com/moment@latest/moment.js",
		zepto: "https://unpkg.com/zepto@latest/dist/zepto.min.js",
		fetch: "https://raw.githubusercontent.com/github/fetch/master/fetch.js",
		vue: "https://unpkg.com/vue@latest/dist/vue.min.js",
		["vue-dev"]: "https://unpkg.com/vue@latest/dist/vue.js"
	},
	deps:{
		vex: ["vexCSS", "vexTheme"],
		jqueryUI: ["jqueryUICSS", loadlifyJS.optjQuery()],
		materialize: ["materializeCSS", "materialIcons", loadlifyJS.optjQuery()],
		bootstrap: ["bootstrapCSS", loadlifyJS.optjQuery()],
		lightgallery: ["lightgalleryCSS"]
	},
	flags: [],
	properties:{
		prefix: "lib/",
		suffix: ".js"
	}
};
class RequireLayer{
	constructor(a){
		this.handler={
			get: (tgt, name)=>{
				return tgt[name];
			},
			set: (tgt, name, val)=>{
				tgt[name]=val;
				return (tgt[name]==val);
			}
		};
		this.exports={};
		self.exports=new Proxy(this.exports, this.handler);
	}
	require(a){
		if(typeof a!="string") throw new Error("Only strings are supported");
		if(this.exports[a]) return this.exports[a];
		return this.loadModule(this.getUrl(a), a);
	}
	getUrl(d){
		if(d.match(/^(((http|https):)|(\/\/))/)) return d;
		if(loadlify.defs.hasOwnProperty(d)) return loadlify.defs[d];
		return new URL(loadlify.props.prefix+d+loadlify.props.suffix, location);
	}
	loadModule(a, b){
		console.warn("This function is not intended for production. Please, use loadlify.load one");
		function* gen(a){
			let req=new XMLHttpRequest();
			req.open("GET", a, false);
			req.send();
			if(req.status!=200) throw new Error("Failed to load "+a+". Status: "+req.status);
			let res=req.responseText;
			res=new Function(res);
			res();
			return res;
		}
		let Z=gen(a).next().value;
		return this.exports[b];
	}
}
(function(){
	//Jump Loadlify to Global Scope
	self.exports={};
	self.loadlifyJS=loadlifyJS;
	self.loadlify=new loadlifyJS({});
	self.load=function(a, b){return self.loadlify.load(a, b)};
	//Require Layer (Experimental) Not suitable for production!
// 	self.requireLayer=new RequireLayer();
})();
