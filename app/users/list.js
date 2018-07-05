(function(){
    'use strict';

    angular
        .module('app')
        .controller('UserListController', Controller);
    
    function Controller($scope, ModulesService, TableService, ngToast) {

        //enable load if data for table is not yet fetched
        $scope.loading = true;

        $scope.users = [];

        $scope.module = {};
        $scope.currentPage = 1;
        $scope.pageSize = 10;

        $scope.reverse = false;

        //showInList not yet implemented, therefore searchbar will search all

        function getUserFields() {
            ModulesService.getModuleByName('users').then(function(aModule) {
                $scope.module = aModule;
            }).catch(function(err) {

            });
        }

        getUserFields();

        function getAllUsers() {
            ModulesService.getAllModuleDocs('users').then(function(users) {                
                $scope.users = users;
            }).catch(function(err) {

            }).finally(function() {
                $scope.loading = false;
            });
        }

        getAllUsers();

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