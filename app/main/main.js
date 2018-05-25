(function(){
    'use strict';

    angular
        .module('app')
        .controller('MainController', Controller);

    
    function Controller($scope, $rootScope, $state) {
        
        console.log($rootScope.user);

        $scope.logout = function () {

            $rootScope.user = {};
            $state.transitionTo('login');
            
        }
    }
})();