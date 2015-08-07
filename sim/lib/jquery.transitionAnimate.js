/*--------------------------------------------------------------------------*
 *  
 *  set transition animate
 *  
 *  MIT-style license. 
 *  
 *  2010 Kazuma Nishihata 
 *  http://blog.webcreativepark.net/2010/09/17-183446.html
 *  
 *--------------------------------------------------------------------------*/
jQuery.fn.transitionAnimate = function(prop,duration,easing,callback){
	if (jQuery.isEmptyObject(prop)) {
		return this
	}
	callback = callback? callback:function(){};
	jQuery(this)
		.css("-webkit-transition","all "+duration+" "+easing)
		.unbind("webkitTransitionEnd")
		.bind("webkitTransitionEnd",function(){
			jQuery(this)
				.unbind("webkitTransitionEnd")
				.css("-webkit-transition","");
			callback.apply(this);
		})
		.css(prop);
	return this;
}