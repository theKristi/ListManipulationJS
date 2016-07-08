var TableView=function(tableElement){
	this.list=new List();
	this.tableElement=tableElement;
	this.sortOnElements=this.tableElement.querySelectorAll("[data-sort-on]");
	this.list.createFromHtml(this.tableElement);
	this.displayed = this.list.getList();
	this.displayedSortedOn = undefined;
	this.SetUpEventListeners();
}
TableView.prototype.buildTable = function(filteredlist) {
    if (filteredlist === undefined)
        filteredlist = this.list.getList();
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

    this.displayed = this.list.sort(this.displayed, attr.currentTarget.innerText, this.asc);
    this.displayedSortedOn = attr;
    this.buildTable(this.displayed);
  
   
}
TableView.prototype.SetUpEventListeners = function () {
    var self = this; // Use so event handlers can use this object.

   

    if (this.sortOnElements) {
        for (var j = 0; j < this.sortOnElements.length; j++) {
            // Handler for when the table headers are clicked, triggering the table to sort.
            this.sortOnElements[j].addEventListener("click", function (event) { self.Sort(event); }, false);
        }
    }

}

$(document).ready(function () {
    var tableViews = [];
    var tables = document.querySelectorAll("[data-sort-table]");
    for (var i = 0; i < tables.length; i++) {
        tableViews.push(new TableView(tables[i]));
    }
});