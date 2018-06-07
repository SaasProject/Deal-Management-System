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


    
    function Controller($scope, $rootScope, $state, ModulesService, TableService) {

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

        function getAllFields () {
            ModulesService.getAllModules().then(function (allModules) {
                var category;
                for (var i = 0; i < allModules.length; i++) {
                    //first condition is to make sure that collections that have 'deal' in its name are only processed.
                    if (allModules[i].name.search('deal') !== -1 && allModules[i].name !== 'deals') {
                        category = allModules[i].name.replace('deal', '');
                        $scope.fields[category] = allModules[i].fields;                        
                    }
                }
            }).catch(function (err) {
            });
        }

        getAllFields();

        function getAllDeals () {
            ModulesService.getAllModuleDocs('deals').then(function (allDeals) {
                $scope.deals = allDeals;
            }).catch(function () {

            });
        }

        getAllDeals();
        $scope.reverse = false;
        $scope.sortColumn = function (category, fieldName) {
            //$scope.column = category + '.' + fieldName;
            $scope.column = category + "['" + fieldName + "']";
            $scope.reverse = !$scope.reverse;
        }
    }
})();