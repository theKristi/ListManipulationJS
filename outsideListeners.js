$(document).ready(function(){
$("#tester").on('sorted',function(e){
$("#sortLabel").text("sorted on: "+e.detail.attribute);
/*if(e.detail.ascending)
var icon=e.detail.element.getAttribute("data-sort-icon-asc");
else 
	icon=e.detail.element.getAttribute("data-sort-icon-desc");
icon=icon
$(e.detail.element.children.icon).removeClass();
$(e.detail.element.children.icon).addClass(icon);
var active=e.detail.element.getAttribute("data-active-sort-classes");
$(e.detail.element).addClass(active).siblings().removeClass(active);*/
});
$("#tester").on("select", function(e){
	
	if(e.detail.action==="Select")
	console.log("select")
	else{
		//get row index
	console.log("Testing 123");
	}
})
})