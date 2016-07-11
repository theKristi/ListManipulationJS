var TableView=function(tableElement){
	this.list=new List();
	this.tableElement=tableElement;
	this.sortOnElements=this.tableElement.querySelectorAll("[data-sort-on]");
	this.searchElement = document.querySelectorAll("[data-search-bar-for=" + this.tableElement.id + "]")[0];
	this.submitSearch=document.querySelectorAll("[data-submit-search-bar-for=" + this.tableElement.id + "]")
	this.highlightClass = this.tableElement.getAttribute("data-highlight-class");
    this.searchFilter = "";
	this.list.createFromHtml(this.tableElement);
	this.displayed = this.list.getList();
	this.displayedSortedOn = undefined;
	this.SetUpEventListeners();
}
TableView.prototype.buildTable = function(filteredlist) {
    if (filteredlist === undefined)
        filteredlist = this.list.getList();
	this.displayed=filteredlist;
		 var tbody = this.tableElement.tBodies[0];
		  if (tbody) {
        while (tbody.lastChild) {
            tbody.removeChild(tbody.lastChild);
        }
    }
    for (var i = 0; i < filteredlist.length; i++) {
        tbody.appendChild(filteredlist[i].html);
        
    }
 
}
TableView.prototype.Sort = function(attr) {
    if (this.displayedSortedOn === attr.currentTarget.innerText)
        this.asc = !this.asc;
    else {
        this.asc = true;
    }
	if(this.asc)
		AddClassesFromAttribute(attr.target,attr.target.children.icon, "data-sort-icon-asc");
	else{
		AddClassesFromAttribute(attr.target,attr.target.children.icon, "data-sort-icon-desc");
	}

    var displayed = this.list.sort(this.displayed, attr.currentTarget.innerText, this.asc);
    this.displayedSortedOn = attr.currentTarget.innerText;
    this.buildTable(displayed);
  
   
}
TableView.prototype.HighlightRow = function (event) {
    var element = event.currentTarget;

    if (element.classList.contains(this.highlightClass)) {
        element.classList.remove(this.highlightClass);
    } else {
        element.classList.add(this.highlightClass);
    }
}
TableView.prototype.Search=function(){
	 this.searchFilter = this.searchElement.value;
	 var properties=this.list.getHeadersFromHtml(this.tableElement.tHead)
	 var filteredList=this.list.search(this.searchFilter,properties)
	 this.buildTable(filteredList);
}
TableView.prototype.SetUpEventListeners = function () {
    var self = this; // Use so event handlers can use this object
  
    if (this.sortOnElements) {
        for (var j = 0; j < this.sortOnElements.length; j++) {
            // Handler for when the table headers are clicked, triggering the table to sort.
            this.sortOnElements[j].addEventListener("click", function (event) { self.Sort(event); }, false);
        }
    }
	if (this.searchElement&&this.submitSearch.length<=0) {
        this.searchElement.addEventListener("keyup", function () { self.Search(); }, false);
    }
	if (this.searchElement&&this.submitSearch) {
		
        for(var i=0;i<this.submitSearch.length;i++){
			this.submitSearch[i].addEventListener("click", function(){self.Search();}, false);
		}
		
    }
	if(this.tableElement.hasAttribute("data-select-table")){
		var rows=this.tableElement.tBodies[0].rows;
		for (var i = 0; i < rows.length; i++) {
            //Handler for when a row is selected
            rows[i].addEventListener("click", function (event) { self.HighlightRow(event); }, false);
	}
	}
}
var AddClassesFromAttribute = function (element, elementToAddClassTo, attrName) {
    if (element.hasAttribute(attrName)) {
        var classes = element.getAttribute(attrName).split(" ");
        for (var i = 0; i < classes.length; i++) {
            elementToAddClassTo.classList.add(classes[i]);
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event) { 
  //do work
    var tableViews = [];
    var tables = document.querySelectorAll("[data-sort-table]");
    for (var i = 0; i < tables.length; i++) {
        tableViews.push(new TableView(tables[i]));
    }
});