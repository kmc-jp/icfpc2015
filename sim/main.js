var W, H;

var units; // = [{ pivot: ..., member: [{x: y:}] }]
var sources;
var board = [];
var $cell = [];

var key = [];

var nowUnit;
var unitId, seedId;

var Tbl = [
	{ key: "p'!.03", val: "W" },
	{ key: "bcefy2", val: "E" },
	{ key: "aghij4", val: "SW" },
	{ key: "lmno 5", val: "SE" },
	{ key: "dqrvz1", val: "CW" },
	{ key: "kstuwx", val: "CCW" }
];
var tbl = {};
//eeeeeeeeeeee                    a      aaae aaaa eaaaaa eaaa!aa  e ee      aa!eeeeeeeeaa   a!!aaaae
var Record = [];

function min(a, b) { return a > b ? b : a; }
function max(a, b) { return a > b ? a : b; }

function initField($display, w, h) {
	W = w, H = h;

	$("#W").val(W);
	$("#H").val(H);

	var $tbody = $("tbody", $display);
	if ($tbody.length == 0) {
		$tbody = $("<tbody>");
		$display.append($tbody);
	}
	else {
		$tbody.children().remove();
	}

	$cell = [];
	for (var y = 0; y < H; ++y) {
		$cell[y] = [];

		var $tr = $("<tr>");
		for (var x = 0; x < W; ++x) {
			var $td = $("<td>").append(
				$("<div>").append(
					$("<div>").append(
						$("<div>").text(Format("({0}, {1})", x, y))
					)
				)
			);
			$tr.append($td);

			$cell[y][x] = $td;
		}
		$tbody.append($tr);
	}

	board = [];
	for (var y = 0; y < H; ++y) {
		board[y] = [];
		for (var x = 0; x < W; ++x) {
			board[y][x] = false;
		}
	}
}

function pSet(x, y, v) {
	if (typeof x == "object") {
		v = y, y = x.y, x = x.x;
	}

	if (v) $cell[y][x].addClass("filled");
	else $cell[y][x].removeClass("filled");
}

var MOD = 4294967296, MUL = 1103515245, INC = 12345;
function nextSeed(seed) {
	var a = seed / 65536 | 0, b = seed % 65536;
	var MUL_seed = ((a * MUL) % 65536 * 65536) + b * MUL;
	return (MUL_seed + INC) % MOD;
}

function load(str) {
	var json = JSON.parse(str);

	initField($("#display"), json.width, json.height);

	units = json.units;
	for (var i = 0, l = units.length; i < l; ++i) {
		var unit = units[i].members;
		var mx = unit[0].x, Mx = unit[0].x, my = unit[0].y;
		for (var j = 0, jl = unit.length; j < jl; ++j) {
			mx = min(mx, unit[j].x);
			Mx = max(Mx, unit[j].x);
			My = max(my, unit[j].y);
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

	for (var i = 0, l = json.filled.length; i < l; ++i) {
		pSet(json.filled[i], 1);
	}

	sources = [];
	for (var i = 0, l = json.sourceSeeds.length; i < l; ++i) {
		sources[i] = [];

		var seed = json.sourceSeeds[i];
		for (var j = 0, jl = json.sourceLength; j < jl; ++j) {
			sources[i][j] = (seed / 65536 | 0) & 32767;
			seed = nextSeed(seed);
		}
		for (var j = 0, jl = sources[i].length; j < jl; ++j) {
			sources[i][j] %= units.length;
		}
	}

	$("#command").focus();
}
function initGame(_seedId) {
	seedId = _seedId;
	unitId = -1;
	nowUnit = {
		pivot: { x: -1, y: -1 },
		members: []
	};
	Record = [];

	board = [];
	for (var y = 0; y < H; ++y) {
		board[y] = [];
		for (var x = 0; x < W; ++x) {
			board[y][x] = false;
		}
	}
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
	if (++unitId >= units.length) return false;

	nowUnit = $.extend(true, {}, units[sources[seedId][unitId]]);

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
		for (var y = 0; y < H; ++y) {
			for (var x = 0; x < W; ++x) {
				pSet(x, y, rec[$sel.prop("selectedIndex")].board[y][x]);
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

		x -= px, y -= py;
		x -= y / 2 | 0;
		if (r == 1) {
			var nx = -y, ny = x+y;
			x = nx, y = ny;
		}
		else if (r == -1) {
			var nx = x+y, ny = -x;
			x = nx, y = ny;
		}
		x += y / 2 | 0;
		x += px, y += py;

		ret.members[i].x = x;
		ret.members[i].y = y;
	}
	return ret;
}
function command(cmd) {
	if (typeof cmd == "string") cmd = decode(cmd);

	initGame(0);

	for (var i = 0, l = cmd.length; i < l; ++i) {
		if (nowUnit.pivot.y < 0) {
			if ( !nextUnit() ) {
				break;
			}
			saveRecord(Record);
		}

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
				for (var y = 0; y < H; ++y) {
					var f = true;
					for (var x = 0; x < W; ++x) {
						if (!board[y][x]) {
							f = false;
							break;
						}
					}
					if (f) {
						if (y > 1) ++dy[y-1];
						dy[y] = -10000;
					}
				}
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
			}
			saveRecord(Record);

			if (nowUnit.pivot.y < 0) {
				if ( !nextUnit() ) {
					break;
				}
				saveRecord(Record);
			}
		}
	}

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
	initField($("#display"), +$("#W").val(), +$("#H").val());

	$("#btn_prev, #btn_next").css("display", "none"); //

	$("#W, #H")
		.click(function() { this.select(); })
		.change(function() {
			initField($("#display"), +$("#W").val(), +$("#H").val());
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
