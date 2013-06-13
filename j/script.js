function onDeviceReady() {
	document
		.addEventListener("backbutton",
			function() {
				window.backButtonHandler();
			},
			true
		);
	init();
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

function init() {
	var html='<div id="ads"/><div id="blog-articles"/>';
	$('body').empty().append(html);
	blogRefresh();
	blogDownload();
}
function blogRefresh() {
	var $wrapper=$('#blog-articles');
	var stories=[];
	Lawnchair(function() {
		this.get('blog', function(results) {
			if (results===null) {
				return;
			}
			$.each(results.stories, function(k, row) {
				var img='';
				if (row.image) {
					img='<img src="'+config.cdn+row.image+'" style="width:100%"/>';
				}
				var d=row.pdate
					.replace(/....-0*([0-9]*)-0*([0-9]*) (..:..).*/, '$1|$2|$3');
				var bits=d.split('|');
				d=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][bits[0]-1]+' '+bits[1]+' '+bits[2];
				var html='<tr data-id="'+row.id+'" id="blog-header-'+row.id+'">'
					+'<td style="width:20%;min-width:80px;" rowspan="2">'
					+img+'</td>'
					+'<td colspan="2" class="title">'+row.title+'</td></tr>'
					+'<tr data-id="'+row.id+'"><td class="tags">'+row.tags+'</td>'
					+'<td class="date">'+d+'</td></tr>'
					+'<tr data-id="'+row.id+'"><td colspan="3" class="blog-body" id="blog-body-'+row.id+'"/></tr>'
					+'<tr><td colspan="3" class="seperator">&nbsp;</td></tr>';
				stories.push(html);
			});
			$wrapper.empty().append(
				'<table style="width:100%">'+stories.join('')+'</table>'
			);
			$wrapper.find('tr').click(function() {
				var id=$(this).data('id');
				blogBodyShow(id);
			});
		});
	});
	$('body').scrollTop(0);
}
function blogBodyShow(id) {
	Lawnchair(function() {
		this.get('blog-body-'+id, function(result) {
			console.log(result);
			if (result===null) {
				$('#blog-body-'+id).html('loading...');
				$.post(
					config.site+'/a/p=blog/f=postGet',
					{'id':id},
					function(ret) {
						Lawnchair(function() {
							this.save(
								{
									'key':'blog-body-'+id,
									'body':ret.body
								},
								function() {
									blogBodyShow(id);
								}
							);
						});
						console.log(ret);
					}
				);
				return;
			}
			$('.blog-body').empty();
			$('#blog-body-'+id)
				.html(
					result.body.replace(
						/<img([^>]*)src="\//g,
						'<img style="width:90%!important"$1src="'+config.cdn+'/'
					)
				);
			$('body').scrollTop($('#blog-header-'+id).offset().top);
		});
	});
}
function blogDownload() {
	clearTimeout(window.blogDownloadTimer);
	if (navigator.connection.type==0) {
		window.blogDownloadTimer=setTimeout(blogDownload, 1000);
		return;
	}
	window.blogDownloadTimer=setTimeout(blogDownload, 600000);
	$.post(
		config.site+'/a/p=blog/f=getRecent',
		function(ret) {
			Lawnchair(function() {
				this.save({'key':'blog','stories':ret}, blogRefresh);
			});
		}
	);
}
