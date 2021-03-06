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
				if(b.includes("astag")){
					let node=document.createElement("link");
					node.setAttribute("rel", "stylesheet");
					node.setAttribute("type", "text/css");
					node.setAttribute("data-loadlify", a.url);
					node.setAttribute("href", a.url);
					document.querySelector("head").appendChild(node);
					return [a.data, {flags:b,url:a.url}];
				}
				let node=document.createElement("style");
				node.innerText=a.data;
				document.querySelector("head").appendChild(node);
				return [a.data, {flags: b, url: a.url}];
			},
			js: async function(a, b){
				if(b.includes("astag")){
					let node=document.createElement("script");
					node.setAttribute("data-src", a.url);
					node.innerHTML=a.data;
					document.querySelector("head").appendChild(node);
					return [document.querySelector("script[data-src='"+a.url+"']"), {flags: b,url:a.url}];
				}else{
					let c,d,e,f,g;
					c="";
					if(b.includes("requirejs")){
						let x=await load("requirejs", ["asplain"]);
						c=x.text;
						if(typeof(this.requireConfig)=="string"){
							c+=this.requireConfig;
						}
					}
					if(b.includes("es6")){
						if(typeof self.exports=="object"){
							var exports=Object.assign({}, self.exports);
						}else{
							var exports={};
						}
					}
					c+=a.data;
					d=new Function(["exports"],c);
					try{
						f=d(exports);
					}catch(x){
						e=x;
						console.warn("An error has ocurred on "+a.url);
					}
					g=[d, {rv:f,flags:b,url:a.url,err:e}];
					if(g[1].err){
						throw g[1].err;
					}
					if(b.includes("es6")){
						g[1]["exports"]=exports;
						if(self.exports){
							self.exports=Object.assign({}, self.exports, exports);
						}
					}
					return g;
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
		let a={
			defs: (a, b)=>{
				return this.defs[a]=b;
			},
			deps: (a, b)=>{
				return this.deps[a]=b;
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
		if(typeof b=="string"){
			b=[b];
		}else if(typeof b=="undefined"){
			b=[];
		}
		b=b.concat(this.flags);
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
		loading.exports=loading.apply[1].exports||{};
		this.loaded[loading.link]=loading;
		return loading;
	}
	loadeps(a, b){
		if(this.deps.hasOwnProperty(a)){
			if(b.includes("noflagsindeps")) b=undefined;
			return this.load(this.deps[a], b);
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
			return "plain";
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
			return "jquery";
		}else{
			return undefined;
		}
	}
}
let defaults={
	defs:{
		jquery: "https://unpkg.com/jquery@latest/dist/jquery.min.js",
		bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
		bootstrapCSS: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
		dexie: "https://unpkg.com/dexie@latest/dist/dexie.min.js",
		jqueryUI: "https://code.jquery.com/ui/1.12.1/jquery-ui.min.js",
		handlebars: "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js",
		jqueryUICSS: "https://code.jquery.com/ui/1.12.1/themes/ui-lightness/jquery-ui.css",
		fontAwesome: "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
		vex: "https://raw.githubusercontent.com/HubSpot/vex/master/dist/js/vex.combined.min.js",
		vexCSS: "https://raw.githubusercontent.com/HubSpot/vex/master/dist/css/vex.css",
		requirejs: "https://unpkg.com/requirejs@latest/require.js",
		vexTheme: "https://raw.githubusercontent.com/HubSpot/vex/master/dist/css/vex-theme-plain.css",
		materializeCSS: "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/css/materialize.min.css",
		materialize: "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/js/materialize.min.js",
		materialIcons: "https://fonts.googleapis.com/icon?family=Material+Icons",
		["material-components-web"]: "https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css",
		["material-components-web-js"]: "https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js",
		["code-prettify"]: "https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js",
		socket_io: "https://unpkg.com/socket.io-client@latest/dist/socket.io.js",
		sha256: "https://unpkg.com/js-sha256@latest/build/sha256.min.js",
		AES: "https://cdn.rawgit.com/ricmoo/aes-js/master/index.js",
		lightgalleryCSS: "https://unpkg.com/lightgallery.js@latest/dist/css/lightgallery.min.css",
		["lightgallery-transitions"]: "https://unpkg.com/lightgallery.js@latest/dist/css/lg-transitions.min.css",
		lightgallery: "https://unpkg.com/lightgallery.js@latest/dist/js/lightgallery.min.js",
		["lightgallery-plugin-pager"]: "https://cdn.rawgit.com/sachinchoolur/lg-pager.js/master/dist/lg-pager.min.js",
		["lightgallery-plugin-share"]: "https://cdn.rawgit.com/sachinchoolur/lg-share.js/master/dist/lg-share.min.js",
		["lightgallery-plugin-fullscreen"]: "https://cdn.rawgit.com/sachinchoolur/lg-fullscreen.js/master/dist/lg-fullscreen.min.js",
		["lightgallery-plugin-zoom"]: "https://cdn.rawgit.com/sachinchoolur/lg-zoom.js/master/dist/lg-zoom.min.js",
		["lightgallery-plugin-video"]: "https://cdn.rawgit.com/sachinchoolur/lg-video.js/master/dist/lg-video.min.js",
		["lightgallery-plugin-thumbnail"]: "https://cdn.rawgit.com/sachinchoolur/lg-thumbnail.js/master/dist/lg-thumbnail.min.js",
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
(function(){
	//Jump Loadlify to Global Scope
	if(!self.noExports){
		self.exports={};
	}
	self.loadlifyJS=loadlifyJS;
	self.loadlify=new loadlifyJS({});
	self.load=function(a, b){return self.loadlify.load(a, b)};
})();
