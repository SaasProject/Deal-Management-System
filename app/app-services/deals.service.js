/*
    Deals Service for Angular
    Author(s): Sanchez, Macku
    Date Created: June 2018
    Description: Angular Service for the Deals Page
    Functions:
        addDeal();
        updateDeal();
        getDealById();
        handleSuccess();
        handleError();
*/


(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('DealsService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.addDeal = addDeal;
        service.updateDeal = updateDeal;
        service.getDealById = getDealById;
 
        return service;  
        
        function addDeal(dealsForm) {
            //console.log(clientForm)
            return $http.post('/deals/addDeal', dealsForm).then(handleSuccess, handleError);
        }

        function updateDeal(dealsForm) {
            //console.log(dealsForm)
            return $http.put('/deals/editDeal', dealsForm).then(handleSuccess, handleError);
        }

        function getDealById(dealId) {
            return $http.get('/deals/' + dealId).then(handleSuccess, handleError);
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