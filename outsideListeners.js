$(document).ready(function(){
//window.localStorage.clear("itemsPerPage");
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
var SelectedRecords=[];
$("#tester").on("Select", function(e){
	
	if(e.detail.action==="Select")
	SelectedRecords.push(e.detail.record)
	else{
		var map=SelectedRecords.map(function (element, index, array){
			//compare element and e.detail.record
			var props=Object.getOwnPropertyNames(element);
			var equal=true;
			for(var i=0;i<props.length;i++)
			{
				if (element[props[i]]!==e.detail.record[props[i]])
				{
					equal=false;
				}
			}
			return equal;
		});
		var index=map.indexOf(true)
		SelectedRecords.splice(index,1);
		
	}
	$(".selectLabel").text("("+SelectedRecords.length+")");
});

})