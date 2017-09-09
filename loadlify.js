"use-strict";
//LoadlifyJS Web Loader
class loadlifyJS{
	constructor(a){
		this.defs=a.defs||defaults.defs;
		this.deps=a.deps||defaults.deps;
		this.loaded=[];
		this.flags=a.flags||defaults.flags;
		this.props=a.properties||defaults.properties;
		this.handlers={
			css: async function(a, b){
				if(typeof $ == "undefined"){
					if(b.includes("nojquery")) throw new Error("CSS load requires jQuery or Zepto");
					await load("zepto");
				}
				$("head").append("<style data-src='"+a.url+"'>"+a.data+"</style>");
				return [a.data, {flags: b, url: a.url}];
			},
			js: async function(a, b){
				if(b.includes("astag")){
					if(typeof $ == "undefined"){
						if(b.includes("nojquery")) throw new Error("CSS load requires jQuery or Zepto");
						await load("zepto");
					}
					$("head").append("<script data-src='"+a.url+"'>"+a.data+"</script>");
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
	async load(a, b){
		if(a==undefined) return "Undefined not allowed";
		if(b==undefined) b=[];
		if(typeof b=="string") b=b[b];
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
			if(d.match(/^(((http|https):)|(\/\/))/)) return c.push(this.st3(d, b));
			if(this.defs.hasOwnProperty(d)) return c.push(this.st3(this.defs[d], b));
			return c.push(this.st3(new URL(d, location), b));
		});
		return await Promise.all(c);
	}
	async st3(a, b){
		return await fetch(a)
		.then(c=>{
			if(c.ok) return c.text();
			throw new Error("Cannot fetch resource");
		})
		.then(d=>this.handlers[this.whatIs(a,b)]({data: d, url: a},b));
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
			return "font";
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
		jQuery: "https://code.jquery.com/jquery-3.2.1.min.js",
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
		zepto: "https://unpkg.com/zepto@1.2.0/dist/zepto.min.js"
	},
	deps:{
		vex: ["vexCSS", "vexTheme"],
		jqueryUI: ["jqueryUICSS", loadlifyJS.optjQuery()],
		materialize: ["materializeCSS", "materialIcons", loadlifyJS.optjQuery()],
		bootstrap: ["bootstrapCSS", loadlifyJS.optjQuery()],
	},
	flags: [],
	properties:{
		prefix: "lib/"
	}
};
(function(){
	self.loadlifyJS=loadlifyJS;
	self.loadlify=new loadlifyJS({});
	self.load=function(a, b){return self.loadlify.load(a, b)};
})();
