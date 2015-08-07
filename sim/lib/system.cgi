require "$lib/jcode.pl";

use Encode;
#use Encode::Guess qw/ascii utf8 euc-jp shiftjis 7bit-jis/;
use URI::Escape;
use utf8;

#============#
#  設定項目  #
#============#

# IPアドレス取得
$addr = $ENV{REMOTE_ADDR};

# 日時を取得
($SEC, $MIN, $HOUR, $DAY, $MON, $YEAR) = localtime();
$YEAR += 1900, ++$MON;
$NOW = $DAY * 3600*24 + $HOUR * 3600 + $MIN * 60 + $SEC;
$NOW2 = sprintf("%04d%02d%02d%02d%02d%02d", $YEAR, $MON, $DAY, $HOUR, $MIN, $SEC);
$MIN2 = $MIN < 10 ? "0$MIN" : $MIN;

binmode STDIN,  ":utf8";
binmode STDOUT, ":utf8";
binmode STDERR, ":utf8";

#----------------#
#  デコード処理  #
#----------------#
sub getFormDatas {
	&decodeFdt;
}
sub decodeFdt {
	my $is_encode = shift;
	$is_encode = !$is_encode;

	local($key, $val, $buf);

	if ($ENV{'REQUEST_METHOD'} eq "POST") {
		if ($ENV{'CONTENT_LENGTH'} > 51200) { &error("投稿量が大きすぎます"); }
		read(STDIN, $buf, $ENV{'CONTENT_LENGTH'});
	}
	else {
		$buf = $ENV{'QUERY_STRING'};
	}
	foreach (split(/&/, $buf)) {
		($key, $val) = split(/=/);

		$val =~ tr/+/ /;
#		$val =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
		$val = uri_unescape( $val ) if defined $in{is_encode} || $is_encode;

		# 文字コードをutf-8変換
#		&jcode'convert(\$val, 'utf8');

		$val =~ s/;Eq;/=/g;
		$val =~ s/\r//g;
		$val =~ s/\x0D//g;
		unless ($in{original}) {
			# 不要コード削除
			$val = &replaceCode($val, "encode");
#		utf8::decode($val);
		}

		$val = Encode::decode("utf8", $val);

		$in{$key} .= "\0" if (defined($in{$key}));
		$in{$key} .= $val;
	}
}
sub d {
	my $str = shift;
	my $dec = Encode::Guess->guess($str);
	return Encode::decode($dec->name, $str);
}
sub d2 { # utf8 ⇒ shiftjis
	my $str = shift;
	$str =~ s/\xEF\xBD\x9E/%nami%/g;
	Encode::from_to($str, "utf8", "shiftjis");
	$str =~ s/%nami%/\x81\x60/g;
	return $str;
}
sub _d2 { # shiftjis ⇒ utf8
	my $str = shift;
	$str =~ s/\x81\x60/%nami%/g;
	Encode::from_to($str, "shiftjis", "utf8");
	$str =~ s/%nami%/\xEF\xBD\x9E/g;
	return $str;
}
sub utf8_to_sjis {
	my $str = shift;
	$str =~ s/\xEF\xBD\x9E/%nami%/g;
	Encode::from_to($str, "utf8", "shiftjis");
	$str =~ s/%nami%/\x81\x60/g;
	return $str;
}
sub sjis_to_utf8 {
	my $str = shift;
	$str =~ s/\x81\x60/%nami%/g;
	Encode::from_to($str, "shiftjis", "utf8");
	$str =~ s/%nami%/\xEF\xBD\x9E/g;
	return $str;
}

#--------------#
#  ヘッダー    #
#--------------#
sub header {
	print "Content-type: text/html; charset=UTF-8\n\n";
	print << "EOM";
<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="Content-Style-Type" content="text/css">
<meta http-equiv="Content-Script-Type" content="text/javascript">
<link rel="stylesheet" type="text/css" href="$lib/style.css">
<link rel="shortcut icon" href="$favicon">
<link rel="stylesheet" href="$lib/jquery/jquery-ui-1.10.4/themes/base/jquery.ui.all.css">
<!--[if lt IE 7]>
<script src="http://ie7-js.googlecode.com/svn/version/2.1(beta4)/IE7.js"></script>
<![endif]-->
<script type="text/javascript" src="$lib/jquery/jquery-2.1.0.min.js"></script>
<script type="text/javascript" src="$lib/jquery/jquery-ui-1.10.4/ui/minified/jquery-ui.min.js"></script>
<script type="text/javascript" src="$lib/jquery/jquery.cookie.js"></script>
<script type="text/javascript" src="$lib/system.js"></script>
<noscript>
JavaScriptに対応したブラウザをご使用下さい。
</noscript>
EOM
}

#--------------#
#  フッター    #
#--------------#
sub footer {
	my $flag = shift|0;
	print qq|<span id="last_tag"></span>| unless $flag;
	print << "EOM";
</html>
EOM
}
sub footer2 {
	print qq|<span id="last_tag"></span></body>|;
	&footer(1);
}

#--------------#
#  エラー処理  #
#--------------#
sub error {
	my $mes = shift;
	# エラーメッセージ
	print <<"EOM";
<HTML>
<head>
<title>ERROR</title>
</head>
<body background="bgimg/error.gif">
<table border align="center" bgcolor="#000000" style="color: #FFFFFF;"><tr><td>
<input type="button" value="< Back" onclick="history.back()" class="button1"><BR>
$mes
</td></tr></table>
</body>
</html>
EOM
	exit;
}

#------------------#
#  データ読み込み  #
#------------------#
sub read_datas {
	%m = ();
	$id = unpack 'H*', $in{name};
	open my $fh, "< user/$id.cgi" or &error("そのような名前($in{name})のプレイヤーは存在しません。");
	for my $hash (split /<>/, <$fh>) {
		my($key, $val) = split /;/, $hash;
		&error("パスワードが違います。") if $key eq 'pass' && $in{pass} ne $val;
		$m{$key} = $val;
	}
	close $fh;
	$m = $m{name};
	$pass = $m{pass};
}

#------------------#
#  データ書き込み  #
#------------------#
sub write_datas {
	my $line = '';
	for my $key (qw/name pass exp money play masao_4 masao_5 masao_6 masao_7 masao_8 masao_9 lv play_id/) { # 保存する変数名
		$line .= "$key;$m{$key}<>";
	}
	open my $fh, "+< user/$id.cgi" or &error("名前、又はパスワードが違います。");
	eval { flock $fh, 2; };
	seek $fh, 0, 0;
	truncate $fh, 0;
	print $fh $line;
	close $fh;
}

#------------------#
#  クッキーを取得  #
#------------------#
sub getCookie {
	local($key, $val, *ck);

	my %ret;

	$ck = $ENV{'HTTP_COOKIE'};
	foreach (split(/;/, $ck)) {
		($key, $val) = split(/=/);
		$key =~ s/\s//g;
		$val = uri_unescape($val);

		utf8::decode($val);
		$ret{$key} = $val;
	}
	return %ret;
}

#------------------#
#  クッキーの発行  #
#------------------#
sub setCookie {
	my($key, $val) = @_;
	$val = uri_escape($val);

	local($gmt, $cook, @t, @m, @w);
	@t = gmtime(time + 60*24*60*60);
	@m = ('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
	@w = ('Sun','Mon','Tue','Wed','Thu','Fri','Sat');

	$gmt = sprintf("%s, %02d-%s-%04d %02d:%02d:%02d GMT",
			$w[$t[6]], $t[3], $m[$t[4]], $t[5]+1900, $t[2], $t[1], $t[0]);
	$cook = "$in{name}<>$in{pass}<>";
	print "Set-Cookie: $key=$val; expires=$gmt\n";
}

#--------------------#
#  フラグを読み込む  #
#--------------------#
sub read_flag {
	my %flags = ();
	open my $fh, "< user/${id}_flag.cgi";
	for my $k (split /<>/, <$fh>) {
		$flags{$k} = 1;
	}
	close $fh;
	return %flags;
}

#------------------#
#  フラグを立てる  #
#------------------#
sub write_flag {
	my $flag = shift;
	open my $fh, ">> user/${id}_flag.cgi";
	print $fh "$flag<>";
	close $fh;
}

#=======================================
# データ取得
#=======================================
sub get_datas {
	my $id = shift;
	my %p = ();
	return 0 unless -e "user/$id";
	open my $fh, "< user/$id/user.cgi";
	for my $k (split /<>/, <$fh>) {
		my($key, $val) = split /\:/, $k;
		$p{$key} = $val;
	}
	close $fh;
	return %p;
}
#=======================================
# 記号置換
#=======================================
sub replaceCode {
	my($val, $mode) = @_;

	if ($mode eq 'decode') {
		$val =~ s/<BR>/\n/g;
		$val =~ s/&quot;/"/g;
		$val =~ s/&gt;/>/g;
		$val =~ s/&lt;/</g;
		$val =~ s/&amp;/&/g;
	}
	else {
		$val =~ s/&/&amp;/g;
		$val =~ s/</&lt;/g;
		$val =~ s/>/&gt;/g;
		$val =~ s/"/&quot;/g;
		$val =~ s/\r//g;
		$val =~ s/\n/<BR>/g;
	}

	return $val;
}

#=================================================
# &alpha($per) : CSS - 不透明度指定
#=================================================
sub alpha {
	my $per = shift;
	my $per2 = $per / 100;
	return "zoom: 1.0; filter: alpha(opacity=$per); opacity: $per2;";
}

#=================================================
# &make_button($r, $g, $b) : CSS - ボタン作成
#=================================================
sub make_button {
	my($r, $g, $b) = @_;
	my $light = 1.4, $nomal = 1.0, $dark = 0.6;
	$light = &make_rgb($r*$light, $g*$light, $b*$light);
	$nomal = &make_rgb($r*$nomal, $g*$nomal, $b*$nomal);
	$dark = &make_rgb($r*$dark, $g*$dark, $b*$dark);

	return "background-color: $nomal; border-left: 1px solid $light; border-top: 1px solid $light; border-right: 1px solid $dark; border-bottom: 1px solid $dark;";
}

#=================================================
# &make_rgb($r, $g, $b) : RGB文字列を返す
#=================================================
sub make_rgb {
	my($r, $g, $b) = @_;
	return "rgb($r, $g, $b)";
}

#=================================================
# &round($r1, $r2, $r3, $r4) : 角を丸める
#=================================================
sub round {
	my($r1, $r2, $r3, $r4) = shift;
	my $ret = "";
	if (defined $r2 || defined $r3 || defined $r4) {
		if (defined $r1) {
			$ret .= "border-top-left-radius: ${r1}px;";
			$ret .= "-webkit-border-top-left-radius: ${r1}px;";
			$ret .= "-moz-border-radius-topleft: ${r1}px;";
		}
		if (defined $r2) {
			$ret .= "border-top-right-radius: ${r2}px;";
			$ret .= "-webkit-border-top-right-radius: ${r2}px;";
			$ret .= "-moz-border-radius-topright: ${r2}px;";
		}
		if (defined $r3) {
			$ret .= "borde-bottom-leftr-radius: ${r3}px;";
			$ret .= "-webkit-bottom-left-border-radius: ${r3}px;";
			$ret .= "-moz-border-radius-bottomleft: ${r3}px;";
		}
		if (defined $r4) {
			$ret .= "border-bottom-right-radius: ${r4}px;";
			$ret .= "-webkit-border-bottom-right-radius: ${r4}px;";
			$ret .= "-moz-border-radius-bottomright: ${r4}px;";
		}
	}
	else { # r1 のみ指定
		$ret .= "border-radius: ${r1}px;";
		$ret .= "-webkit-border-radius: ${r1}px;";
		$ret .= "-moz-border-radius: ${r1}px;";
	}
	return $ret;
}

#=================================================
# $pre : 自動改行
#=================================================
$pre = <<EOM;
	white-space: pre;           /* CSS 2.0 */
	white-space: pre-wrap;      /* CSS 2.1 */
	white-space: pre-line;      /* CSS 3.0 */
	white-space: -pre-wrap;     /* Opera 4-6 */
	white-space: -o-pre-wrap;   /* Opera 7 */
	white-space: -moz-pre-wrap; /* Mozilla */
	white-space: -hp-pre-wrap;  /* HP Printers */
	word-wrap: break-word;      /* IE 5+ */
EOM


#===========================================================
# &res($res, $data) : レスしてexit
#===========================================================
sub res {
	my($res, $data) = @_;
	print "<res>$res</res>" if defined $res;
	print "<data>$data</data>" if defined $data;
	exit;
}


#=================================================
# &ExecuteSQL($db, $statement, \@res)
#
# SQL実行. 戻り値はエラー
#=================================================
sub ExecuteSQL {
	use DBI;
	use Jcode;

	my($db, $statement, $res) = @_; $statement = Jcode->new($statement)->h2z->utf8;
	my $dbh = DBI->connect("DBI:mysql:${db}:${DB_HOST}", $DB_USER, $DB_PASSWD) or return $DBI::errstr;
	my $sth = $dbh->prepare($statement) or return "$dbh->errstr";
	$sth->execute or return ("$statement<BR>" . $sth->errstr);

	# SELECT系
	if (defined $res) {
		@$res = ();
		my @datas = ();
		while (my $ary_ref = $sth->fetchrow_arrayref) {
			my @datas = @$ary_ref;
			for my $i (0 .. $#datas) {
				$datas[$i] = Jcode->new($datas[$i])->h2z->utf8;
				$datas[$i] = Encode::decode("utf8", $datas[$i]);
			}
			push @$res, \@datas;
		}
	}

	$sth->finish;
	$dbh->disconnect;

	return "";
}

1;
