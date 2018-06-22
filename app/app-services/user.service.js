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
        service.Insert = Insert;
        service.Update = Update;
 
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

        /*
            Function name: User App Service CRUD
            Author(s): Flamiano, Glenn
            Date Modified: 2018/06/21
            Description: Functionalites for user add, update, and delete
            Parameter(s): user id, username, and user data
            Return: none
        */
        function GetById(_id) {
            return $http.get('/user/' + _id).then(handleSuccess, handleError);
        }
 
        function GetByUsername(username) {
            return $http.get('/user/' + username).then(handleSuccess, handleError);
        }
 
        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }
 
        function Update(user) {
            return $http.put('/user/' + user._id, user).then(handleSuccess, handleError);
        }
 
        function Delete(_id) {
            return $http.delete('/user/' + _id).then(handleSuccess, handleError);
        }

        function Insert(user){
            return $http.post('/user/addUser', user).then(handleSuccess, handleError);
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