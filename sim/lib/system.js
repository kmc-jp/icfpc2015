// 符号
function F(n) {
	return n < 0 ? -1 : n ? 1 : 0;
}

//======================================
// jQuery拡張
//======================================
$.extend({
	// 画像の事前読み込み
	preloadImages: function() {
		for (var i = 0, l = arguments.length; i < l; ++i) {
			$("<img>").attr("src", arguments[i]);
		}
	},

	// Ajax - Wrapper
	Ajax: function(dt) {
		var send_data = {
			type: "POST",
			cache: false,
			dataType: "text",
			error: function() {
				alert("サーバに接続できません。");
			},
			timeout: 1000*10
		};
		for (var key in dt) { send_data[key] = dt[key]; }

		if (send_data.context == null) send_data.context = {};
		send_data.context._FUNC_ = send_data.success ? send_data.success : function() { };
		send_data.success = function(str) {
			var res = str.match("<res>") ? str.slice(str.indexOf("<res>")+5, str.indexOf("</res>")) : "";
			var data = str.match("<data>") ? str.slice(str.indexOf("<data>")+6, str.indexOf("</data>")) : "";

			this._FUNC_(res, data, this, str);
		}

		$.ajax(send_data);
	}
});

// ボタンにする
$.fn.extend({
	makeButton: function(r, g, b) {
		if (typeof r === "string") {
			r = parseInt(r.substr(0, 2), 16);
			g = parseInt(r.substr(2, 2), 16);
			b = parseInt(r.substr(4, 2), 16);
		}

		var light = 1.4, dark = 0.6;
		var borderTopLeft = "1px solid " + RGB(r*light, g*light, b*light);
		var borderBottomRight = "1px solid " + RGB(r*dark, g*dark, b*dark);
		this.css({
			backgroundColor: RGB(r, g, b),
			"border-top": borderTopLeft,
			"border-left": borderTopLeft,
			"border-bottom": borderBottomRight,
			"border-right": borderBottomRight
		});
		return this;
	}
});

//======================================
// 小物
//======================================
// r, g, b | [r, g, b] -> RGB
function RGB(r, g, b) {
	if ($.type(r) == "array") b = r[2], g = r[1], r = r[0];
	return Format("rgb({0},{1},{2})", (r | 0), (g | 0), (b | 0));
}

// よく使うパラメータ
var userAgent = window.navigator.userAgent.toLowerCase(); 
var appVersion = window.navigator.appVersion.toLowerCase();
var isSmartPhone = navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1 || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0 ? true : false;

// window.close 全ブラウザ対応
window._close = window.close;
window.close = function() {
	try {
		window._close();
	}
	catch (e) {
		window.open('about:blank','_self').close();
	}
}

// 文字列のformat (C++/CLIと同じ)
Format = function(str) {
	var pos = 0;
	while (1) {
		if ( !str.match( new RegExp("\\{" + pos + "\\}") ) ) break;
		if ( pos+1 >= arguments.length ) {
			console.log("Format: lack of arguments");
			return str;
		}

		str = str.replace( new RegExp("\\{" + pos + "\\}", "g") , arguments[pos+1]);
		++pos;
	}
	if ( str.match( new RegExp("\\{[0-9]+\\}") ) ) console.log("Format: incomplete conversion");

	return str;
}
$.fn.extend({
	noDrag: function() {
		$(this)
			.mousemove(function(e) { e.preventDefault(); })
			.mousedown(function(e) { e.preventDefault(); })
			.contextmenu(function(e) { e.preventDefault(); })
			.bind("selectstart", function(e) { e.preventDefault(); });
	}
});
