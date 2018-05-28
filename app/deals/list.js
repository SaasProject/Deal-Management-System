(function(){
    'use strict';

    angular
        .module('app')
        .controller('DealListController', Controller);

    
    function Controller($scope, $rootScope, $state) {
        $scope.filterOptions = [
            'Active',
            '1-2 months',
            'Mine'
        ];

        $scope.filter = $scope.filterOptions[0];

        $scope.console = function () {
            console.log($scope.filter);
        }
    }
})();