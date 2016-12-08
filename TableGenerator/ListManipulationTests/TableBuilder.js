var TableBuilder=function(numColumns, numRows, styleClasses, container){
		console.log('Building table')
	//build table with style classes
	var table="<table id='tester' class='"+styleClasses+"'' data-sort-table data-select-table data-highlight-class='highlight'>"
	//build thead
	var thead='<thead>'
	for(var thindex=0;thindex<numColumns;thindex++){
		var colHeader="<th data-sort-on data-sort-icon-asc='icon-sort_down' data-sort-icon-dsc='icon-sort_up' data-active-sort-classes='blue' search-attribute-for='mainSearch'>"+"Column"+thindex+"<span id='icon'></span></th>";
		thead+=colHeader;
	}
	thead+="</thead>";
	table+=thead;
	
	//build rows
	for(var rowIndex=0;rowIndex<numRows;rowIndex++){
		var row="<tr>"
		for(var colIndex=0;colIndex<numColumns;colIndex++){
			row+="<td>"+Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)+"</td>"
		}
		row+="</tr>"
		table+=row;
	}
	table+="</table>";
	$(container).prepend(table);

}