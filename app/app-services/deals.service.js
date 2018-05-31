(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('DealsService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.addDeal = addDeal;
        service.updateDeal = updateDeal;
 
        return service;  
        
        function addDeal(dealsForm) {
            //console.log(clientForm)
            return $http.post('/deals/addDeal', dealsForm).then(handleSuccess, handleError);
        }

        function updateDeal(dealsForm) {
            //console.log(dealsForm)
            return $http.put('/deals/editDeal', dealsForm).then(handleSuccess, handleError);
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