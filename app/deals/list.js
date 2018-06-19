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
        });


    
    function Controller($scope, $rootScope, $state, ModulesService, DealsService, TableService) {

        $scope.DATE_FORMAT = 'MM/dd/yyyy';

        $scope.filterOptions = [
            'Active',
            '1-2 months',
            'Mine'
        ];

        $scope.deals = [];

        $scope.fields = {
            essential: [],
            profile: [],
            process: [],
            distribution: [],
            status: []
        };

        $scope.currentPage = 1;
        $scope.pageSize = 10;

        $scope.reverse = false;

        function getAllDeals () {
            ModulesService.getAllModuleDocs('deals').then(function (allDeals) {
                $scope.deals = allDeals;
                //compare to '9' not 9 because dropdown values are strings :(
                $scope.deals = $scope.deals.filter(function(aDeal) {
                    return aDeal.profile['Level'] !== '9';
                });
            }).catch(function (err) {

            });
        }

        getAllDeals();

        function getAllFields () {
            ModulesService.getAllModules().then(function (allModules) {
                var category;
                for (var i = 0; i < allModules.length; i++) {
                    //first condition is to make sure that collections that have 'deal' in its name are only processed.
                    if (allModules[i].name.search('deal') !== -1 && allModules[i].name !== 'deals') {
                        category = allModules[i].name.replace('deal', '');
                        $scope.fields[category] = allModules[i].fields;

                        //ewww dirty code 2 for loops, bale 3 nested loops all in all :(
                        //delete properties of each deal which are not shown in the list to avoid its values being searched
                        angular.forEach($scope.fields[category], function(aField) {
                            angular.forEach($scope.deals, function (aDeal) {
                                if(!aField.showInList) {
                                    delete aDeal[category][aField.name];
                                }
                            });
                        });                       
                    }
                }
            }).catch(function (err) {
            });
        }

        getAllFields();
        
        $scope.sortColumn = function (category, fieldName) {
            //$scope.column = category + '.' + fieldName;
            $scope.column = category + "['" + fieldName + "']";
            $scope.reverse = TableService.sortSelectedColumn($scope.reverse, $scope.column).result;
        }
        
        $scope.sortClass = function (category, fieldName) {
            return TableService.sortSelectedClass($scope.reverse, category + "['" + fieldName + "']", $scope.column);
        }

        /* $scope.deleteDeal = function (aDeal) {
            console.log('weee');
            if (confirm('are you sure you want to delete ' + aDeal.essential['Deal Name'] + '?')) {
                DealsService.deleteDeal(aDeal.ID).then(function () {
                    getAllDeals();
                }).catch(function (err) {});
            }
        } */
    }
})();