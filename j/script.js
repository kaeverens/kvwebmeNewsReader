function onDeviceReady() {
	document
		.addEventListener("backbutton",
			function() {
				window.backButtonHandler();
			},
			true
		);
	// { set up databases
	setUpDatabases();
	// }
}
function setUpDatabases() {
	window.indexedDB = window.indexedDB || window.mozIndexedDB
		|| window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction
		|| window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange
		|| window.webkitIDBKeyRange || window.msIDBKeyRange
	if (!window.indexedDB) {
		alert('This device does not support IndexedDB');
		return;
	}
	window.db=window.indexedDB.open('db2', 2);
	window.db.onupgradeneeded=function(e) {
		var db=e.target.result;
		var objectStore=db.createObjectStore('blog');
		objectStore.createIndex('pdate', 'pdate', { 'unique': false });
		objectStore.createIndex('id', 'id', { 'unique': true });
		var objectStore=db.createObjectStore('ads');
		objectStore.createIndex('type', 'type', { 'unique': false });
		objectStore.createIndex('last_viewed', 'last_viewed', { 'unique': false});
		objectStore.createIndex('id', 'id', { 'unique': true});
	};
}
// { setZeroTimeout (very fast replacement for setTimeout)
var setZeroTimeout=function(a){if(a.postMessage){var b=[],c="asc0tmot",d=function(a){b.push(a),postMessage(c,"*")},e=function(d){if(d.source==a&&d.data==c){d.stopPropagation&&d.stopPropagation();if(b.length)try{b.shift()()}catch(e){setTimeout(function(a){return function(){throw a.stack||a}}(e),0)}b.length&&postMessage(c,"*")}};if(a.addEventListener)return addEventListener("message",e,!0),d;if(a.attachEvent)return attachEvent("onmessage",e),d}return setTimeout}(window);
// }

window.inBrowser=/https?:\/\//.test(document.location.toString());
if (inBrowser) {
	window.navigator.app={
		'overrideBackbutton':function(){
		},
		'exitApp':function() {
			document.location=document.location.toString().replace(/#.*/, '');
		}
	};
	window.navigator.connection={
		'type':'wifi'
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
	function init() {
		if (window.db==undefined || !window.db || window.db.readyState!='done') {
			return setTimeout(init, 100);
		}
		var html='<div id="ads"/><div id="blog-articles"/>';
		$('body').empty().append(html);
//		blogRefresh();
		blogDownload();
	}
	init();
});
function blogRefresh() {
	var $wrapper=$('#blog-articles');
	var db=window.db.result;
	var transaction=db.transaction(['blog']);
	var objectStore=transaction.objectStore('blog');
	var stories=[];
	objectStore.openCursor().onsuccess=function(e) {
		var cursor=e.target.result;
		if (cursor) {
			var row=cursor.value;
			var img='';
			if (row.image) {
				img='<img src="'+config.site+row.image+'" style="width:100%"/>';
			}
			var d=row.pdate
				.replace(/....-0*([0-9]*)-0*([0-9]*) (..:..).*/, '$1|$2|$3');
			var bits=d.split('|');
			d=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][bits[0]-1]+' '+bits[1]+' '+bits[2];
			var html='<tr data-id="'+row.id+'"><td style="width:20%" rowspan="2">'
				+img+'</td>'
				+'<td colspan="2" class="title">'+row.title+'</td></tr>'
				+'<tr data-id="'+row.id+'"><td class="tags">'+row.tags+'</td>'
				+'<td class="date">'+d+'</td></tr>'
				+'<tr><td colspan="3" class="seperator">&nbsp;</td></tr>';
			stories.push(html);
			cursor.continue();
		}
		else {
			$wrapper.empty().append(
				'<table style="width:100%">'+stories.join('')+'</table>'
			);
		}
	}
	$('body').scrollTop(0);
}
function blogDownload() {
	clearTimeout(window.blogDownloadTimer);
	if (navigator.connection.type==0) {
		window.blogDownloadTimer=setTimeout(blogDownload, 1000);
		return;
	}
	window.blogDownloadTimer=setTimeout(blogDownload, 60000);
	$.post(
		config.site+'/a/p=blog/f=getRecent',
		function(ret) {
			var db=window.db.result;
			var transaction=db.transaction(['blog'], 'readwrite');
			transaction.oncomplete=function() {
				if (newStories) {
					setZeroTimeout(blogRefresh);
				}
			}
			var objectStore=transaction.objectStore('blog');
			var newStories=0;
			for (var i in ret) {
				var row=ret[i];
				row.id=+row.id;
				try{
					var request=objectStore.add(row, row.id);
					request.onerror=function(e) {
					};
					request.onsuccess=function(e) {
						newStories++;
					}
				}
				catch(e) {
					return;
				}
			}
		}
	);
}
