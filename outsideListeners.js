$(document).ready(function(){

$("#tester").on('Sorted',function(e){
$("#sortLabel").text("Sorted on: "+e.detail.attribute);
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
$("#tester").on("Searched", function(e){
	var searchResults=e.detail.results;
	var target=e.detail.target;
	var attributes=e.detail.attributes;
	
	
	
	for(var record in searchResults){
		clearHighlights(searchResults[record].html);
		if(target!=="")
		highlightMatches(searchResults[record],target, attributes)
	
	}
	console.log("\n")
});
function highlightMatches(record, target, propertiesSearched){
	var regex = new RegExp(target,'gi');
	
	//get at record data
	for(var index in propertiesSearched){
		var cell=record.html.cells[index]
		var property=propertiesSearched[index];
		//get matches in property column
		var stringToCheck=record[property];
		var result=[];
		
	
		if(stringToCheck!==""){
			while ( (result = regex.exec(stringToCheck)) ) {
				var msg = 'Found ' + result[0] + ' in '+stringToCheck+'. ';
  msg += 'Next match starts at ' + regex.lastIndex;
  console.log(msg);
				//matches.push(result.index);
				updateHtml(cell,result.index,result.index+target.length)
		
			}//end while
			
		}//end if
	
		
	}
}
function updateHtml(element, start, end) {
    var item = $(element);
    var str = item.data("origHTML");
    if (!str) {
        str = item.html();
        item.data("origHTML", str);
    }
    str = str.substr(0, start) +
        '<span class="hilite">' + 
        str.substr(start, end - start) +
        '</span>' +
        str.substr(end);
    item.html(str);
}
function clearHighlights(element){
	var highlights=$(element).find(".hilite").contents().unwrap();

}
});