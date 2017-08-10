"use-strict";
let props={
	prefijo: "lib/"
};
var loaderDefs={
	bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
	dexie: "https://unpkg.com/dexie@1.5.1/dist/dexie.min.js",
	jqueryUI: "https://code.jquery.com/ui/1.12.1/jquery-ui.min.js",
	handlebars: "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js",
	jqueryUICSS: "https://code.jquery.com/ui/1.12.1/themes/ui-lightness/jquery-ui.css",
	fontAwesome: props.prefijo+"fontAwesome/css/font-awesome.min.css",
	vex: props.prefijo+"vex/dist/js/vex.combined.min.js",
	vexCSS: props.prefijo+"vex/dist/css/vex.css",
	vexTheme: props.prefijo+"vex/dist/css/vex-theme-plain.css",
	materializeCSS: "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/css/materialize.min.css",
	materialize: "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/js/materialize.min.js",
	materialIcons: "https://fonts.googleapis.com/icon?family=Material+Icons",
	socket_io: props.prefijo+"socket.io/dist/socket.io.js",
	sha256: props.prefijo+"js-sha256/build/sha256.min.js",
	AES: "https://cdn.rawgit.com/ricmoo/aes-js/master/index.js",
	listJS: "//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js", //listJS no funciona con eval() https://github.com/javve/list.js/issues/528
	typedJS: "lib/typedjs/lib/typed.min.js",
	openpgp: props.prefijo+"openpgp/dist/openpgp.min.js",
	test: "test.js"
}
var loaderDeps={
	vex: ["vexCSS", "vexTheme"],
	jqueryUI: ["jqueryUICSS"],
	materialize: ["materializeCSS", "materialIcons"]
}
var loaderLoaded=[];
function load(a){
	function loadjs(a){
		return fetch(a).then(b=>{
			return new Promise((resolver, rechazar)=>{
				b.text().then(c=>{
					eval(c);
					resolver(a);
				});
			});
		});
	}
	function loadcss(a){
		return fetch(a).then(b=>{
			return b.text().then(c=>{
				return new Promise((resolver, rechazar)=>{
					$("head").append("<style data-from='"+a+"'>"+c+"</style>");
					resolver(a);
				});
			});
		});
	}
	function pre(a){
		if(typeof a!="string"){
			console.log("Hemos recibido algo diferente de un string:", a);
			a.forEach(b=>{
				init(b);
			});
		}else{
			if(what(a)=="js"){
				let z=loadjs(a);
				loaderLoaded.push(a);
				return z;
			}else if(what(a)=="css" || what(a)=="font"){
				let z=loadcss(a);
				loaderLoaded.push(a);
				return z;
			}
		}
    }
    function deps(a){
        if(loaderDeps.hasOwnProperty(a)){
            var b=loaderDeps[a];
            var c;
            if(loaderDeps[a]!=undefined){
                c=loaderDeps[a];
            }
        }
        return c;
    }
    function init(a){
        if(a==undefined){
            return;
        }
        if(typeof a == "string"){
            if(loaderLoaded.indexOf(a)==-1){
                if(loaderDefs.hasOwnProperty(a)){
                    return pre(loaderDefs[a]);
                }else{
                    return pre(props.prefijo+a);
                }
            }else{
                return true;
            }
        }else{
			return new Promise((resolver, rechazar)=>{
				$.each(a, (k, v)=>{
					if(typeof v != "string"){
						init(v);
						return;
					}
					let url;
					if(loaderDefs.hasOwnProperty(v)){
						url=loaderDefs[v];
					}else{
						url=props.prefijo+v;
					}
					if(loaderLoaded.indexOf(url)==-1){
						return pre(url);
					}else{
						return true;
					}
				});
				resolver(a);
			});
        }
    }
    if(typeof a=="string"){
		if(deps(a)!=undefined){
			let todo=[];
			todo.push(a);
			todo.push(deps(a));
			let prom=[];
			todo.forEach(b=>{
				prom.push(init(b));
			});
			return Promise.all(prom);
			//return init(todo);
		}else{
			return init(a);
		}
	}else{
		let todo=[];
		$.each(a, (k, v)=>{
			if(deps(v)!=undefined){
				todo.push(deps(v));
			}
		});
		let b=a.concat(todo);
		let prom=[];
		b.forEach(c=>{
			prom.push(init(c));
		});
		return Promise.all(prom);
// 		return init(a.concat(todo));
	}
}
function what(a){
    if(a.match(/(.*\.js)/)){
        return "js";
    }else if(a.match(/(.*\.css)/)){
        return "css";
    }else if(a.match(/(.*fonts.*)/)){
		return "font";
	}else{
        return undefined;
    }
}
(function(){
	if(typeof loaderInit=="undefined"){
		return;
	}
	try{
		load(loaderInit).then(()=>{
			if(typeof loaderProps=="object"&&typeof loaderProps.eventos=="object"){
				loaderProps.eventos.onload();
			}else{
				console.log("Init terminado");
				console.warn("Debería de haber una función esperando a que el init termine!");
			}
		});
	}catch(e){
		console.error(e);
		throw new Error("No hemos podido cargar los scripts de inicio");
	}
})();
