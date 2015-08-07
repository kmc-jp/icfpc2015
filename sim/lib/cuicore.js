function max(a, b) { return a < b ? b : a; }
function min(a, b) { return a < b ? a : b; }

var CUI = function($tbl, W, H, cellSize) {
	var $tbl = $tbl;
	var $cell;

	// 各種取得系
	this.getWidth = function() { return W; }
	this.getHeight = function() { return H; }
	this.getCell = function(x, y) { return $cell[y][x]; }
	this.getTable = function() { return $tbl; }
	this.getCellSize = function() { return cellSize; }

	// W x Hの画面で初期化
	this.Init = function(_W, _H, L) {
		W = _W, H = _H;
		if (L != null) cellSize = L;

		$tbl.addClass("CUI");

		var $tbody = $tbl.children("tbody");

		if ($tbody.length == 0) {
			$tbody = $("<tbody>");
			$tbl.append($tbody);
		}
		else {
			$tbody.children().remove();
		}

		var ret = [];
		for (var y = 0; y < H; ++y) {
			ret[y] = [];
			var $tr = $("<tr>");
			for (var x = 0; x < W; ++x) {
				var $td = $("<td>");
				var $div1 = $("<div>");
				var $div2 = $("<div>").text("　");
				$div1.append($div2);
				$td.append($div1);
				$tr.append($td);
				ret[y][x] = $div2;
			}
			$tbody.append($tr);
		}

		this.setCellSize(cellSize);

		$cell = ret;

		return ret;
	}

	this.setCellSize = function(sz) {
		cellSize = sz;
		$("td>div", $tbl).css({
			width: sz,
			height: sz
		})
		.children("div").css({
			fontSize: sz*4
		});
	}

	// (x,y)が描画外か
	this.isOut = function(x, y) {
		return x < 0 || x >= W || y < 0 || y >= H;
	}

	// (x,y)に点を打つ
	// 真/偽/ { val: 真/偽, color: 色, callback: cell毎のcallback }, 指定したもののみ適用(例えばcolorのみ)
	this.pSet = function(x, y, p) {
		if ( this.isOut(x, y) ) return false;
		if (typeof p === "object") {
			if (p.val != null) {
				this.pSet(x, y, p.val);
			}
			if (p.color != null) {
				$cell[y][x].css("color", p.color);
			}
			if (p.data != null) {
				$cell[y][x].data("data", p.data);
			}
			if (p.callback != null) {
				p.callback({ x: x, y: y, v: p })
			}
		}
		else {
			var val = p ? "■" : "　";
			$cell[y][x].text(val);
		}
		return true;
	}

	// (x,y)の点情報取得. fが指定され真なら詳細情報取得.
	this.pGet = function(x, y, f) {
		if (f) {
			return {
				val: $cell[y][x].text() == "■",
				color: $cell[y][x].css("color"),
				data: $cell[y][x].data("data")
			};
		}
		else {
			return $cell[y][x].text() == "■";
		}
	}

	// 長方形描画, (x2,y2)は開区間
	this.rect = function(x1, y1, x2, y2, p) {
		if (x1 > x2) { var temp = x1; x1 = x2; x2 = temp; }
		if (y1 > y2) { var temp = y1; y1 = y2; y2 = temp; }

		x1 = min(max(x1, 0), W-1);
		x2 = min(max(x2, 0), W);
		y1 = min(max(y1, 0), H-1);
		y2 = min(max(y2, 0), H);

		for (var y = y1; y < y2; ++y) {
			for (var x = x1; x < x2; ++x) {
				this.pSet(x, y, p);
			}
		}
	}

	// 直線描画
	this.line = function(x1, y1, x2, y2, p) {
		if (x1 > x2) {
			{ var temp = x1; x1 = x2; x2 = temp; }
			{ var temp = y1; y1 = y2; y2 = temp; }
		}

		if (x1 == x2) {
			if (y1 > y2) {
				var temp = y1; y1 = y2; y2 = temp;
			}
			for (var y = max(y1, 0), ly = min(y2, H-1); y <= ly; ++y) {
				this.pSet(x1, y, p);
			}
		}
		else {
			var a = (y2-y1)/(x2-x1);
			var sx = max(x1, -1), lx = min(x2, W);
			var by = a*(sx-x1)+y1 + 0.5 | 0;
			for (var x = sx; x <= lx; ++x) {
				var y = a*(x-x1)+y1 + 0.5 | 0;
				var th = (by + Y) / 2 + 0.5 | 0;
				if (by != y) {
					var sy, gy;
					if (by < y) {
						sy = by+1;
						gy = y;
					}
					else {
						sy = y;
						gy = by-1;
					}
					for (var Y = sy; Y <= gy; ++Y) {
						var X = y < th ? x-1 : x;
						this.pSet(X, Y, p);
					}
				}
				else {
					this.pSet(x, y, p);
				}
				by = y;
			}
		}
	}

	// image: 画像 [[]] / [""], 左上座標指定
	this.draw = function(x, y, image) {
		for (var dy = 0, ldy = image.length; dy < ldy; ++dy) {
			for (var dx = 0, ldx = image[dy].length; dx < ldx.length; ++dx) {
				this.pSet(x+dx, y+dy, image[dy][dx]);
			}
		}
	}

	this.Init(W, H, cellSize); // cell[y][x]: td>div>div
};
