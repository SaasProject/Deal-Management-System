(function(){
    'use strict';

    angular
        .module('app')
        .controller('ClientListController', Controller)
        /*
            Function name: Object filter
            Author(s): Flamiano, Glenn
            Date Modified: 5/29/2018
            Description: to order the rows of the table
            Parameter(s): none
            Return: Array
        */
        .filter('orderObjectBy', function() {
          return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
              filtered.push(item);
            });
            filtered.sort(function (a, b) {
              return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
          };
        })

        /*
            Function name: Pagination filter
            Author(s): Flamiano, Glenn
            Date Modified: 5/29/2018
            Description: to slice table per page based on number of items
            Parameter(s): none
            Return: Array
        */
        .filter('pagination', function(){
            return function(data, start){
                //data is an array. slice is removing all items past the start point
                return data.slice(start);
            };
        });

    
    function Controller($scope, $rootScope, $state, ClientService) {
        $scope.filterOptions = [
            'Active',
            '1-2 months',
            'Mine'
        ];

        $scope.filter = $scope.filterOptions[0];

        $scope.console = function () {
            console.log($scope.filter);
        }

        /*
            Function name: Calculate Object size
            Author(s): Flamiano, Glenn
            Date Modified: 5/29/2018
            Description: to compute the size of an object
            Parameter(s): none
            Return: size
        */
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        /*
            Function name: getAllClients
            Author(s): Flamiano, Glenn
            Date Modified: 5/29/2018
            Description: Retrieves all client data from clients collection from DealManager in mongoDB
            Parameter(s): none
            Return: none
        */
        function getAllClients() {
            ClientService.getAllClients().then(function (clients) {
                $scope.allClients = clients;
                $scope.clientLength = Object.size(clients);
            }).finally(function() {

            });
        }
        getAllClients();

        $scope.deleteClient = function(clientId){
            ClientService.deleteClient(clientId).then(function (res) {
                console.log(res);
                getAllClients();
            }).finally(function() {

            });
        }
    }
})();