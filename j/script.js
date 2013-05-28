function onDeviceReady() {
	document
		.addEventListener("backbutton",
			function() {
				window.backButtonHandler();
			},
			true
		);
}
// { setZeroTimeout (very fast replacement for setTimeout)
var setZeroTimeout=function(a){if(a.postMessage){var b=[],c="asc0tmot",d=function(a){b.push(a),postMessage(c,"*")},e=function(d){if(d.source==a&&d.data==c){d.stopPropagation&&d.stopPropagation();if(b.length)try{b.shift()()}catch(e){setTimeout(function(a){return function(){throw a.stack||a}}(e),0)}b.length&&postMessage(c,"*")}};if(a.addEventListener)return addEventListener("message",e,!0),d;if(a.attachEvent)return attachEvent("onmessage",e),d}return setTimeout}(window);
// }

if (/test/.test(document.location.toString())) {
	window.navigator.app={
		'overrideBackbutton':function(){
		},
		'exitApp':function() {
			document.location=document.location.toString().replace(/#.*/, '');
		}
	};
	window.navigator.connection={
		'network':{
			'connection':{
				'type':'wifi'
			}
		}
	};
	window.navigator.notification={
		'beep':function() {
		},
		'confirm':function(msg, callback) {
			var val=confirm(msg);
			callback(+val);
		}
	};
	$(function() {
		$('body').keydown(function(event) {
			if (event.keyCode == 27) {
				window.backButtonHandler();
				document.location='#';
				event.stopPropagation();
			}
		});
		onDeviceReady();
	});
}
else {
	document.addEventListener("deviceready", onDeviceReady, false);
}
window.backButtonHandler=function(){
}

$(function() {
});
