(function(){
    'use strict';

    angular
        .module('app')
        .controller('LoginController', Controller);

    
    function Controller($scope, $rootScope, $state, UserService, ngToast, $http) {
        $scope.loginForm = {
            email: '',
            password: ''
        };

        $scope.login = function () {
            UserService.login($scope.loginForm).then(function(data) {
                //attach token to 'Authorization' Header
                $http.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                $rootScope.user = data.user;
                $state.transitionTo('home');
            }).catch(function(err) {
                $scope.message = 'Username/Password incorrect';
                //ngToast.danger('Username/Password incorrect');
                console.log(err);
            });
        }
    }
})();