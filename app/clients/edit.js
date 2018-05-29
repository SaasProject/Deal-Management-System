(function(){
    'use strict';

    angular
        .module('app')
        .controller('EditClientController', Controller);

    
    function Controller($scope, $rootScope, $state, ClientService) {
        
        $scope.clientForm = {};

        $scope.EditClient = ClientService.getSelected();
        console.log($scope.EditClient);

        $scope.saveClient=function(client){


             ClientService.updateClient($scope.EditClient)
                    .then(function () {
                        console.log("client updated") 
                    })
                    .catch(function (error) {
                        console.log("client not updated") 
                    });
        }

    }
})();