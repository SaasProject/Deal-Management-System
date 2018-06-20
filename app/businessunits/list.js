(function(){
    'use strict';

    angular
        .module('app')
        .controller('BUListController', Controller);
    
    function Controller($scope, ModulesService, TableService, ngToast) {
        $scope.businessUnits = [];

        $scope.module = {};
        $scope.currentPage = 1;
        $scope.pageSize = 10;

        $scope.reverse = false;

        function getBUFields() {
            ModulesService.getModuleByName('businessunits').then(function(aModule) {
                $scope.module = aModule;
            }).catch(function(err) {

            });
        }

        getBUFields();

        function getAllBUs() {
            ModulesService.getAllModuleDocs('businessunits').then(function(businessUnits) {
                $scope.businessUnits = businessUnits;
            }).catch(function(err) {

            });
        }

        getAllBUs();

        $scope.sortColumn = function (fieldName) {
            //$scope.column = category + '.' + fieldName;
            $scope.column = fieldName;
            $scope.reverse = TableService.sortSelectedColumn($scope.reverse, $scope.column).result;
        }
        
        $scope.sortClass = function (fieldName) {
            return TableService.sortSelectedClass($scope.reverse, fieldName, $scope.column);
        }
    }

})();