(function(){
    'use strict';

    angular
        .module('app')
        .controller('DealListController', Controller)
        
        /*
            Function name: Pagination filter
            Author(s): Flamiano, Glenn
            Date Created: June 6, 2018
            Date Modified: June 6, 2018
            Description: to slice table per page based on number of items
            Parameter(s): none
            Return: Array
        */
        .filter('pagination', function(){
            return function(data, start){
                //data is an array. slice is removing all items past the start point
                return data.slice(start);
            };
        })

        /*
            Function name: Object filter
            Author(s): Flamiano, Glenn
            Date Created: June 6, 2018
            Date Modified: June 6, 2018
            Description: to order the rows of the table
            Parameter(s): none
            Return: Array
        */
        .filter('orderObjectBy', function() {
          return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
              filtered.push(item);
            });
            filtered.sort(function (a, b) {
              return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
          };
        });

    
    function Controller($scope, $rootScope, $state, ModulesService, TableService) {

        $scope.DATE_FORMAT = 'MM/dd/yyyy';

        $scope.filterOptions = [
            'Active',
            '1-2 months',
            'Mine'
        ];

        $scope.deals = []

        $scope.fields = {
            essential: [],
            profile: [],
            process: [],
            distribution: [],
            status: []
        }

        //for table header sorting
        $scope.allFieldName = [];
        $scope.filter = $scope.filterOptions[0];

        function getAllFields () {
            ModulesService.getAllModules().then(function (allModules) {
                var category;
                var allModulesLength = allModules.length;
                for (var i = 0; i < allModulesLength; i++) {
                    //first condition is to make sure that collections that have 'deal' in its name are only processed.
                    if (allModules[i].name.search('deal') !== -1 && allModules[i].name !== 'deals') {
                        category = allModules[i].name.replace('deal', '');
                        $scope.fields[category] = allModules[i].fields;
                        //insert category in each field
                        var tempFields = $scope.fields[category];
                        for(var r = 0; r < tempFields.length; r++){
                            var fieldToInsert = tempFields[r];
                            fieldToInsert["category"] = category;
                            $scope.allFieldName.push(fieldToInsert);
                        }
                    }
                }
            }).catch(function (err) {
            });
        }

        getAllFields();

        /*
            Function name: Calculate Object size
            Author(s): Flamiano, Glenn
            Date Created: June 6, 2018
            Date Modified: June 6, 2018
            Description: to compute the size of an object
            Parameter(s): none
            Return: size
        */
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        // initialize pages of deals list
        $scope.currentPage = 1;
        $scope.pageSize = 10;


        // Table sort functions
        $scope.column = 'ID'; //column to be sorted
        $scope.reverse = false; // sort ordering (Ascending or Descending). Set true for desending

        /*
            Function name: Sort Table Columns
            Author(s): Flamiano, Glenn
            Date Created: June 6, 2018
            Date Modified: June 6, 2018
            Description: To sort the table by ascending/desending order by clicking the column header
            Parameter(s): column
            Return: none
        */
        $scope.sortColumn = function(col){
            $scope.column = col;
            $scope.reverse = TableService.sortSelectedColumn($scope.reverse, col).result;
        };

        /*
            Function name: Sort Class
            Author(s): Flamiano, Glenn
            Date Created: June 6, 2018
            Date Modified: June 6, 2018
            Description: To change column sort arrow UI when user clicks the column
            Parameter(s): column
            Return: none
        */
        $scope.sortClass = function(col){
            return TableService.sortSelectedClass($scope.reverse, col, $scope.column);
        } 

        // End of Table Functions

        //To display deals w/o category for table sorting
        $scope.noCategoryDeal = {};

        function getAllDeals () {
            ModulesService.getAllModuleDocs('deals').then(function (allDeals) {
                $scope.deals = allDeals;
                $scope.dealsLength = Object.size(allDeals);
                console.log($scope.dealsLength);

                //This is to remove nested category in deals
                for(var z = 0; z < allDeals.length; z++){
                    var specificDeal = allDeals[z];
                    var tempDeal = {};
                    tempDeal['essential ID'] = specificDeal.ID;
                    for (var key in specificDeal.essential) {
                        tempDeal['essential '+key] = specificDeal.essential[key];
                    }
                    for (var key in specificDeal.profile) {
                        tempDeal['profile '+key] = specificDeal.profile[key];
                    }
                    for (var key in specificDeal.process) {
                        tempDeal['process '+key] = specificDeal.process[key];
                    }
                    for (var key in specificDeal.distribution) {
                        tempDeal['distribution '+key] = specificDeal.distribution[key];
                    }
                    for (var key in specificDeal.status) {
                        tempDeal['status '+key] = specificDeal.status[key];
                    }
                    for (var key in specificDeal.content) {
                        tempDeal['content '+key] = specificDeal.content[key];
                    }
                    $scope.noCategoryDeal[z] = tempDeal;
                }
            }).catch(function () {

            });
        }

        getAllDeals();
    }
})();