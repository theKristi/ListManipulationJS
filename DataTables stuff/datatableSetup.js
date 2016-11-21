var Table;
   $(document).ready(function() {
            var columnMap = [
                { "bSearchable": true },
                { "bSearchable": true },
                { "bSearchable": true },
				{ "bSearchable": false },
                
            ];
            Table =$("#tester").DataTable({
                "searchHighlight": true,
				"dom":'lrtip',
                "pageLength": 10,
                "oLanguage": {
                    "sZeroRecords": "No records matching search criteria"
                },
                "aoColumns": columnMap
            });
			  PriorityColIndex = 3;
			SetSearchSortPriorityUIElements(columnMap);
			$("#searchbar").on('keyup', function(e){
				SearchByPriority(this.value);
			})
			
            $("#tester").show();
			
			
			
			  
   })