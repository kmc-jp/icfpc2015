var W, H;

var units; // = [{ pivot: ..., member: [{x: y:}] }]
var sources = [[]];
var sourceLength;

var board = [], initialBoard = [];
var $cell = [];

var key = [];

var nowUnit;
var unitId;

var Tbl = [
	{ key: "p'!.03", val: "W" },
	{ key: "bcefy2", val: "E" },
	{ key: "aghij4", val: "SW" },
	{ key: "lmno 5", val: "SE" },
	{ key: "dqrvz1", val: "CW" },
	{ key: "kstuwx", val: "CCW" }
];
var tbl = {};
var Record = [];

function min(a, b) { return a > b ? b : a; }
function max(a, b) { return a > b ? a : b; }

function initField($display, w, h, isSubTable) {
	if (!isSubTable) {
		W = w, H = h;

		$("#W").val(W);
		$("#H").val(H);

		board = [];
		for (var y = 0; y < H; ++y) {
			board[y] = [];
			for (var x = 0; x < W; ++x) {
				board[y][x] = false;
			}
		}
		initialBoard = $.extend(true, [], board);
	}

	var $tbody = $("tbody", $display);
	if ($tbody.length == 0) {
		$tbody = $("<tbody>");
		$display.append($tbody);
	}
	else {
		$tbody.children().remove();
	}

	var $ret = [];
	for (var y = 0; y < h; ++y) {
		$ret[y] = [];

		var $tr = $("<tr>");
		for (var x = 0; x < w; ++x) {
			var $td = $("<td>").append(
				$("<div>").append(
					$("<div>").append(
						$("<div>").text(Format("({0}, {1})", x, y)).append(
							$("<div>")
						)
					)
				)
			);
			$tr.append($td);

			$ret[y][x] = $td;
		}
		$tbody.append($tr);
	}

	if (!isSubTable) {
		$cell = $ret;
		command("");
	}

	return $ret;
}

function pSet(x, y, v, $c) {
	if (typeof x == "object") {
		v = y, y = x.y, x = x.x;
	}
	if ($c == null) $c = $cell;

	if (v) $c[y][x].addClass("filled");
	else $c[y][x].removeClass("filled");
}

var MOD = 4294967296, MUL = 1103515245, INC = 12345;
function nextSeed(seed) {
	var a = seed / 65536 | 0, b = seed % 65536;
	var MUL_seed = ((a * MUL) % 65536 * 65536) + b * MUL;
	return (MUL_seed + INC) % MOD;
}

function load(str) {
	var json = JSON.parse(str);

	$cell = initField($("#display"), json.width, json.height);

	units = json.units;
	for (var i = 0, l = units.length; i < l; ++i) {
		var unit = units[i].members;
		var mx = unit[0].x, Mx = unit[0].x, my = unit[0].y;
		for (var j = 0, jl = unit.length; j < jl; ++j) {
			mx = min(mx, unit[j].x);
			Mx = max(Mx, unit[j].x);
			my = min(my, unit[j].y);
		}
		var len = Mx - mx + 1;
		marginLeft = (W - len) / 2 | 0;

		var dx = marginLeft - mx;
		var dy = -my;

		units[i].pivot.x += dx;
		units[i].pivot.y += dy;
		for (var j = 0, jl = unit.length; j < jl; ++j) {
			unit[j].x += dx;
			unit[j].y += dy;
		}
	}

	initialBoard = [];
	for (var y = 0; y < H; ++y) {
		initialBoard[y] = [];
		for (var x = 0; x < W; ++x) {
			initialBoard[y][x] = false;
		}
	}
	for (var i = 0, l = json.filled.length; i < l; ++i) {
		initialBoard[json.filled[i].y][json.filled[i].x] = true;
		pSet(json.filled[i], 1);
	}

	sourceLength = json.sourceLength;

	var $sel_seed = $("#seed");
	$sel_seed.children().remove();
	for (var i = 0, l = json.sourceSeeds.length; i < l; ++i) {
		$sel_seed.append(
			$("<option>").val(json.sourceSeeds[i]).text(json.sourceSeeds[i])
		);
	}
	$sel_seed.unbind("change").change(function() {
		sources = makeSource(+$(this).val());

		var $ul = $("#next ul");
		$ul.children().remove();
		for (var i = 0, l = sources.length; i < l; ++i) {
			var $tbl = $("<table>").prop("cellpadding", 0).prop("cellspacing", 0).addClass("board");
			var $li = $("<li>").append($tbl);
			var unit = units[sources[i] % units.length];
			var minX = unit.pivot.x, minY = unit.pivot.y, maxX = unit.pivot.x, maxY = unit.pivot.y;
			for (var j = 0, jl = unit.members.length; j < jl; ++j) {
				var x = unit.members[j].x, y = unit.members[j].y;
				minX = min(minX, x);
				maxX = max(maxX, x);
				minY = min(minY, y);
				maxY = max(maxY, y);
			}
			var w = maxX - minX + 1, h = maxY - minY + 1;
			var $c = initField($tbl, w, h, true);
			var dx = -minX, dy = -minY;
			for (var j = 0, jl = unit.members.length; j < jl; ++j) {
				var x = unit.members[j].x+dx, y = unit.members[j].y+dy;
				pSet(x, y, true, $c);
			}
			$c[unit.pivot.y+dy][unit.pivot.x+dx].addClass("pivot");
			$ul.append($li);
		}
	});
	$sel_seed.prop("selectedIndex", 0);
	$sel_seed.change();

	$("#command").focus();
}
function makeSource(seed) {
	var ret = [];

	for (var i = 0, l = sourceLength; i < l; ++i) {
		ret[i] = (seed / 65536 | 0) & 32767;
		seed = nextSeed(seed);
	}
	for (var i = 0, l = sources.length; i < l; ++i) {
		ret[i] %= units.length;
	}
	return ret;
}
function initGame() {
	sources = $("#seed").children().length > 0 ? makeSource(+$("#seed").val()) : [];
	unitId = -1;
	nowUnit = {
		pivot: { x: -1, y: -1 },
		members: []
	};
	Record = [];

	board = $.extend(true, [], initialBoard);
}
function isValidLocation(unit) {
	if (unit == null) unit = nowUnit;
	for (var i = 0, l = unit.members.length; i < l; ++i) {
		var x = unit.members[i].x, y = unit.members[i].y;
		if (x < 0 || x >= W || y < 0 || y >= H) return false;
		if (board[y][x]) return false;
	}
	return true;
}
function nextUnit() {
	if (++unitId >= sources.length) return false;

	nowUnit = $.extend(true, {}, units[sources[unitId]]);

	return isValidLocation();
}
function drawRecord($sel, rec) {
	$sel.children().remove();

	for (var i = 0, l = rec.length; i < l; ++i) {
		$sel.append(
			$("<option>").text(Format("{0}", i))
		);
	}

	$sel.unbind("change");
	$sel.change(function() {
		var sidx = $sel.prop("selectedIndex");
		for (var y = 0; y < H; ++y) {
			for (var x = 0; x < W; ++x) {
				pSet(x, y, rec[sidx].board[y][x]);
				if (typeof rec[sidx].board[y][x] == "number") $cell[y][x].addClass("pivot");
				else $cell[y][x].removeClass("pivot");
			}
		}
	});

	$sel.prop("selectedIndex", rec.length-1);
	$sel.change();
}
function saveRecord(rec) {
	var b = $.extend(true, [], board);
	if (nowUnit.pivot.y > -1) {
		for (var i = 0, l = nowUnit.members.length; i < l; ++i) {
			var x = nowUnit.members[i].x, y = nowUnit.members[i].y;
			b[y][x] = true;
		}
		{
			var x = nowUnit.pivot.x;
			var y = nowUnit.pivot.y;
			b[y][x] = b[y][x] ? 1 : 0;
		}
	}
	rec.push({
		uid: unitId,
		board: b
	});
}
function move(x, y) {
	if (typeof x == "number") x = y = { x: x, y: y };
	var d = [x, y];

	var ret = $.extend(true, {}, nowUnit);
	var pid = ret.pivot.y % 2;
	ret.pivot.x += d[pid].x;
	ret.pivot.y += d[pid].y;
	for (var i = 0, l = ret.members.length; i < l; ++i) {
		var did = ret.members[i].y % 2;
		ret.members[i].x += d[did].x;
		ret.members[i].y += d[did].y;
	}
	return ret;
}
function rotate(r) {
	var ret = $.extend(true, {}, nowUnit);
	var px = ret.pivot.x, py = ret.pivot.y;
	for (var i = 0, l = ret.members.length; i < l; ++i) {
		var x = ret.members[i].x, y = ret.members[i].y;

		x -= y / 2 | 0;
		x -= px - (py / 2 | 0), y -= py;
		if (r == 1) {
			var nx = -y, ny = x+y;
			x = nx, y = ny;
		}
		else if (r == -1) {
			var nx = x+y, ny = -x;
			x = nx, y = ny;
		}
		x += px - (py / 2 | 0), y += py;
		x += y / 2 | 0;

		ret.members[i].x = x;
		ret.members[i].y = y;
	}
	return ret;
}
function command(str_cmd) {
	var cmd = decode(str_cmd);

	initGame(0);

	var f = nextUnit();
	saveRecord(Record);

	var lastPos = -1;
	var isFinished = false;

	if (f) {
		lastPos = cmd.length-1;
		for (var i = 0, l = cmd.length; i < l; ++i) {
			var next;
			if (cmd[i] == "W") {
				next = move(-1, 0);
			}
			else if (cmd[i] == "E") {
				next = move(1, 0);
			}
			else if (cmd[i] == "SW") {
				next = move({ x: -1, y: 1 }, { x: 0, y: 1 });
			}
			else if (cmd[i] == "SE") {
				next = move({ x: 0, y: 1 }, { x: 1, y: 1 });
			}
			else if (cmd[i] == "CW") {
				next = rotate(1);
			}
			else if (cmd[i] == "CCW") {
				next = rotate(-1);
			}
			else {
				console.log(cmd[i]);
			}

			if (next != null) {
				if (isValidLocation(next)) {
					nowUnit = next;
				}
				else {
					// locate
					for (var j = 0, jl = nowUnit.members.length; j < jl; ++j) {
						var x = nowUnit.members[j].x, y = nowUnit.members[j].y;
						board[y][x] = true;
					}
					nowUnit.pivot.x = nowUnit.pivot.y = -1;

					// clear
					var dy = [];
					for (var y = 0; y < H; ++y) dy[y] = 0;
					for (var y = H-1; y >= 0; --y) {
						var f = true;
						for (var x = 0; x < W; ++x) {
							if (!board[y][x]) {
								f = false;
								break;
							}
						}
						if (f) {
							for (var x = 0; x < W; ++x) {
								board[0][x] = false;
							}
							for (var Y = y-1; Y >= 0; --Y) {
								for (var x = 0; x < W; ++x) {
									board[Y+1][x] = board[Y][x];
								}
							}
							++y;
						}
					}
/*
					for (var y = H-1; y > 0; --y) {
						if (dy[y] >= 0) dy[y-1] += dy[y];
					}
					for (var y = H-1; y >= 0; --y) {
						for (var x = 0; x < W; ++x) {
							if (dy[y] >= 1) board[y+dy[y]][x] = board[y][x];
						}
					}
					if (dy[0] != 0) {
						for (var x = 0; x < W; ++x) {
							board[0][x] = false;
						}
					}
*/
				}
				saveRecord(Record);

				if (nowUnit.pivot.y < 0) {
					if ( !nextUnit() ) {
						isFinished = true;
						lastPos = i;
						break;
					}
					saveRecord(Record);
				}
			}
		}
	}

	$("#finish").children().remove();
	$("#finish").css("display", "").append(
		$("<span>").text(str_cmd.substr(0, lastPos+1)).css("color", (isFinished ? "blue" : "black"))
	).append(
		$("<span>").text(str_cmd.substr(lastPos+1, str_cmd.length))
	);

	drawRecord($("#record"), Record);
}
function decode(cmd) {
	var ret = [];
	for (var i = 0, l = cmd.length; i < l; ++i) {
		ret[i] = tbl[cmd[i]];
	}
	return ret;
}

function initTable() {
	for (var i = 0, l = Tbl.length; i < l; ++i) {
		for (var j = 0, jl = Tbl[i].key.length; j < jl; ++j) {
			tbl[Tbl[i].key[j]] = Tbl[i].val;
		}
	}
}

function moveRec(d) {
	var sidx = $("#record").prop("selectedIndex");
	if (0 <= sidx+d && sidx+d < $("#record option").length) {
		$("#record").prop("selectedIndex", sidx+d).change();
	}
}

$(function() {
	initTable();
	$cell = initField($("#display"), +$("#W").val(), +$("#H").val());

	$("#btn_prev, #btn_next").css("display", "none"); //

	$("#W, #H")
		.click(function() { this.select(); })
		.change(function() {
			$cell = initField($("#display"), +$("#W").val(), +$("#H").val());
		});

	$(document).bind("dragenter", function(e) {
		e.preventDefault();
	}).bind("dragover", function(e) {
		e.preventDefault();
	}).bind("drop", function(e) {
		var files = e.originalEvent.dataTransfer.files;
		if (files.length > 1) {
			alert("複数のファイルを同時には読み込めません。");
		}
		else if (files.length == 1) {
			var file = files[0];

			var reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function(e) {
				load(reader.result);
			}
		}
		e.preventDefault();
	});

	$("#btn_command").click(function() {
		command($("#command").val());
	});

	$("#btn_recLeft").click(function() {
		moveRec(-1);
	});
	$("#btn_recRight").click(function() {
		moveRec(1);
	});
	$(document).keydown(function(e) {
		key[e.keyCode] = true;
		if (key[16]) { // Shift
			if (e.keyCode == 37) { // ←
				moveRec(-1);
			}
			else if (e.keyCode == 39) { // →
				moveRec(1);
			}
		}
	}).keyup(function(e) {
		key[e.keyCode] = false;
	});
});
