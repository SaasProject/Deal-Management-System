(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('UserService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.login = login;
        service.getCurrent = getCurrent;
        service.logout = logout;
 
        return service;    
        
        function login(loginForm) {
            return $http.post('/user/login', loginForm).then(handleSuccess, handleError);
        }

        function getCurrent() {
            return $http.get('/user/current').then(handleSuccess, handleError);
        }

        function logout() {
            return $http.get('/user/logout').then(handleSuccess, handleError);
        }
 
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }
    }
 
})();