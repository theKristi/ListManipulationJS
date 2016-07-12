"use strict";
var List = function(list) {
   
    var _list = [];
    this.setList = function(list) {
        if (this.isListValid(list)) {
            _list = list;
			
        } else
            throw "Invalid list: call getValidationErrors(list) for details";
    }
    this.getList = function() {
        return _list;
    }
    if (list != undefined)
        this.setList(list);


}; //end constructor

List.prototype.createFromHtml = function(tableSelected) {
    //pull off properties into array
    if (tableSelected && tableSelected.children.length > 0) {
		var tbody=tableSelected.tBodies[0];
        var properties = this.getHeadersFromHtml(tableSelected.tHead);

        //for each row in collection
        for (var i = 0; i < tbody.rows.length; i++) {
            var rowparent = tbody.rows[i];
            var newObject = this.emptyObject(properties);
            
            var row = rowparent.children;

            for (var cell = 0; cell < row.length; cell++) {
                if (properties[cell] != undefined) {
                    if (row[cell].children[0] !== undefined) {
                        //get child property value
                        var chlidNodeName = row[cell].children[0].nodeName;
                        var childClassName = row[cell].children[0].className;

                        switch (chlidNodeName) {
                        case "SELECT":
                            newObject[properties[cell]] = row[cell].children[0].selectedOptions[0].value;
                            break;
                        case "INPUT":
                            if (childClassName === "check-box")
                                newObject[properties[cell]] = row[cell].children[0].checked;
                            break;
                        default:
                            newObject[properties[cell]] = row[cell].children[0].innerText.trim();
                            break;
                        }
                    } else {
                        var string = row[cell].outerText.replace("\\n", "").trim();
                        if (row[cell].hasAttribute("dataType"))
                            string = this.convertToType(string, row[cell].getAttribute("dataType"));
                        newObject[properties[cell]] = string;
                    }
                }
            }
			newObject.html = rowparent;
            this.getList().push(newObject);

        }
    }

};

List.prototype.sort = function (sublist, attrName, asc) {
    attrName = attrName.trim();
    attrName = attrName.replace(/\s+/g, '');
    if (!sublist) {
        sublist = this.getList();
    }
    if (asc === undefined || asc === null)
        asc = true;
    if (sublist.length < 1)
        return sublist;
    if (attrName == undefined || sublist[0][attrName] == undefined) {
        throw 'Attribute to sort on does not exist, or is not defined by the object';

    }

    sublist.sort(this.compare(attrName));
    if (!asc)
        sublist.reverse();
    return sublist;
};

List.prototype.search = function(target, attributes) {
   
    var filteredList = [];
	var wholeList=this.getList();

    if (attributes === undefined||attributes==null) {
        attributes = Object.getOwnPropertyNames(wholeList[0]);
		
    } else {
        var listAttributes = Object.getOwnPropertyNames(wholeList[0]);
        attributes.forEach(function(attr) {
            var res = 0;
            if (listAttributes.indexOf(attr) <= -1)
                throw "Attribute [" + attr + "] is not valid to search on";

        });
    }
    if (target !== undefined && target !== null) {
        target = target.toLowerCase();
        filteredList =wholeList.filter(function(object) {
            //check for attributes which contain target
            for (var attr in attributes) {
				
                attributes[attr]=attributes[attr].trim();
                var searchString = object[attributes[attr]].toString();
                if (typeof searchString === 'string') {
                    searchString = searchString.toLowerCase();
                    if (searchString.indexOf(target) > -1)
                        return true;
                }
            }
            return false;
        });

    }
    return filteredList;

};

List.prototype.toPages = function(entriesPerPage, sublist) {
    if (sublist === undefined || sublist === null)
        sublist = this.getList();
    var pages = [];
// ReSharper disable once QualifiedExpressionMaybeNull
    for (var i = 0; i < sublist.length; i += entriesPerPage) {
        pages.push(sublist.slice(i, i + entriesPerPage));
    }
    //ensure empty list has atleast 1 page
    if (sublist.length <= 0)
        pages.push([]);
    return pages;
};

List.prototype.isListValid = function(list) {

    if (list === undefined || list === null)
        return false;
    if (!Array.isArray(list))
        return false;
    var valid;
    
    list.forEach(function(entry) {
        if (typeof entry !== 'object') {
            valid = false;
        }
    });
    if (valid != undefined)
        return false;
    if (list.length>0) {
        var propNames = JSON.stringify(Object.getOwnPropertyNames(list[0]));
        for (var i = 1; i < list.length; i++) {
            var objectPropNames = JSON.stringify(Object.getOwnPropertyNames(list[i]));
            if (objectPropNames !== propNames) {
                return false;
            }

        }
    }
    return true;
};


List.prototype.getValidationErrors = function(list) {

    var errors = [];
    if (!Array.isArray(list)) {
        errors.push("data passed in is not an array");
    } else {
        list.forEach(function(entry) {
            if (typeof entry !== 'object') {
                if (errors.indexOf("Array is not consistantly of type object") <= 0)
                    errors.push("Array is not consistantly of type object");
            }

        });
        //verify list objects all have the same properties
        var propNames = JSON.stringify(Object.getOwnPropertyNames(list[0]));

        for (var i = 1; i < list.length; i++) {
            var objectPropNames = JSON.stringify(Object.getOwnPropertyNames(list[i]));
            if (objectPropNames !== propNames) {
                errors.push("Member at index " + i + " does not have consistant properties " +
                    "with member at index 0");
            }
        }

    }
    return errors;
};

List.prototype.emptyObject = function(headers) {
    var object = {};
    if (!headers)
        headers = Object.getOwnPropertyNames(this.getList()[0]);
    for (var entry in headers) {
        object[headers[entry]] = "";
    }
    return object;
};

List.prototype.getHeadersFromHtml = function(headerRow) {
if(headerRow.localName=="thead")
	headerRow=headerRow.children[0].cells;


    var headers = [];
    for (var entry in headerRow) {

        if (headerRow[entry].outerText != undefined) {
            var string = headerRow[entry].outerText.trim();
            string = string.replace(/\s+/g, '');
            headers.push(string);

        }
    }
    return headers;
};

List.prototype.compare = function(attrName) {
    return function(a, b) {

        var typea = typeof a[attrName];
        var typeb = typeof b[attrName];
        if (typea === typeb) {
            switch (typea) {
                case "string":
                   
                        return a[attrName].localeCompare(b[attrName]);
                 
            case "boolean":
                if ((a[attrName] && b[attrName]) || (!a[attrName] && !b[attrName]))
                    return 0;
                if (a[attrName] && !b[attrName])
                    return 1;
                else {
                    return -1;
                }
            default:
                return a[attrName] - b[attrName];
            }

        }
        throw "cannot compare " + typea + " and " + typeb;

    }
};
List.prototype.convertToType= function(toConvert, type) {
    switch (type) {
    case "date":
        var date = Date.parse(toConvert);
        if (date !== NaN)
            return date;
        break;
        default:
            return toConvert.toString();
    }
}