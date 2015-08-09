var Sound = function(){}

Sound.playSound = function(fn){
	try{
		if (!window.HTMLAudioElement){
			var au = document.createElement("bgsound");
			au.src = fn;
			document.getElementsByTagName("head")[0].appendChild(au);
		} else {
			var au = new Audio(fn);
			au.play();
		}
	} catch(e) {
		return false;
	}
}

Sound.Audio = function(fn){
	var cannotUse;
	var soundId;
	var src;
	var isFirst;
	var loop;
	var currentTime;
	var paused;
	this.currentTime = null;
	this.loop = 0;
	this.isFirst = 1;
	this.cannotUse = 0;
	this.paused = 0;
	if (!window.HTMLAudioElement){
		this.cannotUse = 1;
	}
	else {
		this.preload = new Audio(this.src);
	}
	this.soundId = "Audio" + Math.random() + Math.random();
	while(!!document.getElementById(soundId)){
		this.soundId = "Audio" + Math.random() + Math.random();
	}
	this.src = fn;
	if (!this.cannotUse){
		var au;
	}
}

Sound.Audio.prototype.play = function(){
	try{
		if ((this.isFirst) && (this.src != "") && (!!this.src)){
			if (this.cannotUse){
				var au = document.createElement("bgsound");
				au.src = this.src;
				au.setAttribute("id",this.soundId);
				au.setAttribute("volume","0");
				if (this.loop != 0){
					au.setAttribute("loop",this.loop);
				}
				document.getElementsByTagName("head")[0].appendChild(au);
			} else {
				this.au = new Audio(this.src);
				if (this.loop != 0){
					this.au.loop = this.loop;
				}
				if (this.currentTime != null){
					this.au.currentTime = this.currentTime;
				}
				this.au.play();
			}
			this.isFirst = 0;
		} else {
			if ((this.src != "") && (!!this.src)){
				if (this.cannotUse){
					document.getElementById(this.soundId).src = this.src;
				} else {
					if ((this.paused) && (this.currentTime == null)){
						this.au.play();
					} else {
						if (this.currentTime != null){
							this.au.currentTime = this.currentTime;
						} else {
							this.au.currentTime = 0;
						}
						this.au.play();
					}
				}
			}
		}
	} catch(e) {
		return false;
	}
}

Sound.Audio.prototype.stop = function(){
	if (!this.isFirst){
		if (this.cannotUse){
			document.getElementById(this.soundId).src = "";
		} else {
			this.au.pause();
		}
	this.paused = 0;
	}
}

Sound.Audio.prototype.pause = function(){
	if (this.cannotUse){
		document.getElementById(this.soundId).src = "";	
	} else {
		this.au.pause();
	}
	this.paused = 1;
}