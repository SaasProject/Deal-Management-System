(function(){
    'use strict';

    angular
        .module('app')
        .controller('MainController', Controller);

    
    function Controller($scope, $rootScope, $state, UserService) {
        
        console.log($rootScope.user);

        $scope.logout = function () {

            UserService.logout().then(function() {
                $rootScope.user = {};
                $state.transitionTo('login');
            });            
        }
    }
})();