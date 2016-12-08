var TableBuilder=function(numColumns, numRows, styleClasses, container){
	//build table with style classes
	var table="<table id='tester' class='"+styleClasses+"'' data-sort-table data-select-table data-highlight-class='highlight'>"
	//build thead
	var thead='<thead>'
	for(var thindex=0;thindex<numColumns;thindex++){
		var colHeader="<th>"+"Column"+thindex+"<th>";
		thead+=colHeader;
	}
	thead+="</thead>";
	table+=thead;
	table+="</table>";

}