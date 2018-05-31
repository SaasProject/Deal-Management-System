(function(){
    'use strict';

    angular
        .module('app')
        .controller('DealListController', Controller);

    
    function Controller($scope, $rootScope, $state, ModulesService) {
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
                    }
                }
                console.log($scope.fields);
            }).catch(function (err) {
            });
        }

        getAllFields();

        function getAllDeals () {
            ModulesService.getAllModuleDocs('deals').then(function (allDeals) {
                $scope.deals = allDeals;
                console.log(allDeals);
            }).catch(function () {

            });
        }

        getAllDeals();

        $scope.console = function () {
            console.log($scope.filter);
        }
    }
})();