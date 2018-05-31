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
            console.log('oii');
            UserService.login($scope.loginForm).then(function(user) {
                $rootScope.user = user;
                $state.transitionTo('home');
            }).catch(function(err) {
                $scope.message = 'Username/Password incorrect';
                console.log(err);
            });
        }
    }
})();