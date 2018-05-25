(function(){
    'use strict';

    angular
        .module('app')
        .controller('LoginController', Controller);

    
    function Controller($scope, $rootScope, $state) {
        var sampleAccount = {
            email: 'aa@bb.com',
            password: 'hii'
        };

        $scope.login = function () {
            
            //sample. no authentication.
            $rootScope.user = sampleAccount;
            $state.transitionTo('home');
            
        }
    }
})();