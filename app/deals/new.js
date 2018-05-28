(function(){
    'use strict';

    angular
        .module('app')
        .controller('NewDealController', Controller);

    
    function Controller($scope, $rootScope, $state) {
        $scope.dealForm = {};

        $scope.submit = function () {
            console.log($scope.dealForm);
        }
    }
})();