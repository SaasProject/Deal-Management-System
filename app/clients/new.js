(function(){
    'use strict';

    angular
        .module('app')
        .controller('NewClientController', Controller);

    
    function Controller($scope, $rootScope, $state, ClientService) {
        

        $scope.clientForm = {};

    	//hehe();

        $scope.addClient=function(){
        	console.log($scope.clientForm);


             ClientService.addClient($scope.clientForm)
                    .then(function () {
                        console.log("client added") 
                    })
                    .catch(function (error) {
                        console.log("client not added") 
                    });
        }

        $scope.editClient=function(client){
            console.log(client);


             /*ClientService.addClient($scope.clientForm)
                    .then(function () {
                        console.log("client added") 
                    })
                    .catch(function (error) {
                        console.log("client not added") 
                    });*/
        }

    }
})();