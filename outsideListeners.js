$(document).ready(function(){
$("#tester").on('sorted',function(e){
$("#sortLabel").text("sorted on: "+e.detail);
});
$("#tester").on("select", function(e){
	var jQueryRecord=$(e.detail.record.html.outerHTML)
	if(e.detail.action==="Select")
	$("#selectedRecords").append(jQueryRecord);
	else{
		//get row index
	console.log("Testing 123");
	}
})
})