(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('ClientService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.addClient = addClient;
        service.getAllClients = getAllClients;
        service.updateClient = updateClient;
 
        return service;  
        
        function addClient(clientForm) {
            //console.log(clientForm)
            return $http.post('/client/addClient', clientForm).then(handleSuccess, handleError);
        }

        function getAllClients(){
            return $http.get('/client/getAllClients').then(handleSuccess, handleError);
        }

        function updateClient(client) {
            return $http.put('/client/updateClient/' + client._id, client).then(handleSuccess, handleError);
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