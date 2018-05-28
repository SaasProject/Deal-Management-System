(function(){
    'use strict';

    angular
        .module('app')
        .controller('LoginController', Controller);

    
    function Controller($scope, $rootScope, $state, UserService) {
        $scope.loginForm = {
            email: '',
            password: ''
        };

        $scope.login = function () {
            UserService.login($scope.loginForm).then(function(user) {
                $rootScope.user = user;
                $state.transitionTo('home');
            }).catch(function(err) {
                console.log(err);
            });
        }
    }
})();