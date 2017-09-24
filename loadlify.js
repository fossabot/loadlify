"use-strict";
//LoadlifyJS Web Loader
class loadlifyJS{
	constructor(a){
		this.prefetch();
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
	prefetch(){
		this.pref=new Promise(resolver=>{
			delete window.fetch;
			let x=new XMLHttpRequest();
			x.open("GET", defaults.defs.fetch, true);
			x.send();
			x.onloadend=a=>{
				console.log(a);
				new Function(a.target.response)();
				resolver(a);
			};
		});
	}
	load(a, b){
		return this.load2(a, b).then(a=>{
			if(typeof a=="array"){
				let todo=[];
				a.forEach(x=>{
					return todo.push(this.loaded[this.links[a]]);
				});
				return Promise.all(todo);
			}else{
				return this.loaded[this.links[a]];
			}
		});
	}
	async load2(a, b){
		if(b==undefined) b=[];
		if(typeof b=="string") b=[b];
		b.concat(this.flags);
		if(!navigator.onLine && b.includes("force")!= false) throw new Error("OFFLINE!");
		if(a==undefined) throw new Error("Undefined not allowed");
		if(typeof a=="string"){
			return await this.st1(a, b);
		}else{
			let todo=[];
			a.forEach(c=>{
				todo.push(this.st1(c, b));
			});
			return await Promise.all(todo);
		}
	}
	async st1(a, b){
		if(typeof a=="string"){
			a=[a];
		}
		if(b.includes("nodeps") || this.deps[a]==undefined) return this.st2(a, b);
		let rt= await this.load(this.deps[a], b);
		let rt2=await this.st2(a, b);
		return [rt, rt2];
	}
	async st2(a, b){
		let c=[];
		a.forEach(d=>{
			if(d.match(/^(((http|https):)|(\/\/))/)) return c.push(this.st3(d, b,a));
			if(this.defs.hasOwnProperty(d)) return c.push(this.st3(this.defs[d], b,a));
			if(b.includes("noprefix")) return c.push(this.st3(new URL(d, location), b,a));
			return c.push(this.st3(new URL(this.props.prefix+d, location), b,a));
		});
		return Promise.all(c);
	}
	async st3(a, b,f){
		if(Object.keys(this.loaded).includes(a)&&(b.includes("nocache")!=true||b.includes("force")!=true)) return this.loaded.valueOf(a);
		this.links[f]=a;
		let type=this.whatIs(a,b);
		await this.pref;
		try{
			let rsp=fetch(a)
			.then(c=>{
				if(c.ok) return c.text();
				throw new Error("Cannot fetch resource");
			})
			.then(d=>
				this.handlers[type]({data: d, url: a},b)
			);
			this.loaded[a]=rsp;
			return rsp;
		}catch(e){
			delete this.loaded[a];
			throw e;
		}
	}
	whatIs(a, b){
		if(typeof a=="object" && 'href' in a) a=a.href;
		
		let reg=/(as)((css)|(js)|(font)|(html)|(plain))/;
		let res=b.filter(x=>x.match(reg));
		if(res[0]) return res[0].match(reg)[2];
		
		if(a.match(/(.*\.js)/)){
			return "js";
		}else if(a.match(/(.*\.css)/)){
			return "css";
		}else if(a.match(/(.*\.(html)|(htm))/)){
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
		socket_io: "https://unpkg.com/socket.io-client@latest/dist/socket.io.js",
		sha256: "https://unpkg.com/js-sha256@latest/build/sha256.min.js",
		AES: "https://cdn.rawgit.com/ricmoo/aes-js/master/index.js",
		listJS: "//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js", //listJS no funciona con eval() https://github.com/javve/list.js/issues/528
		typedJS: "https://raw.githubusercontent.com/mattboldt/typed.js/master/lib/typed.min.js",
		openpgp: "https://unpkg.com/openpgp@latest/dist/openpgp.min.js",
		moment: "https://unpkg.com/moment@latest/moment.js",
		zepto: "https://unpkg.com/zepto@1.2.0/dist/zepto.min.js",
		fetch: "https://raw.githubusercontent.com/github/fetch/master/fetch.js"
	},
	deps:{
		vex: ["vexCSS", "vexTheme"],
		jqueryUI: ["jqueryUICSS", loadlifyJS.optjQuery()],
		materialize: ["materializeCSS", "materialIcons", loadlifyJS.optjQuery()],
		bootstrap: ["bootstrapCSS", loadlifyJS.optjQuery()],
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
	self.loadlifyJS=loadlifyJS;
	self.loadlify=new loadlifyJS({});
	self.load=function(a, b){return self.loadlify.load(a, b)};
	//Require Layer (Experimental) Not suitable for production!
// 	self.requireLayer=new RequireLayer();
})();
