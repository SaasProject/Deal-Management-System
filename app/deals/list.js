(function(){
    'use strict';

    angular
        .module('app')
        .controller('DealListController', Controller)
        
        /*
            Function name: Pagination filter
            Author(s): Flamiano, Glenn
            Date Created: June 6, 2018
            Date Modified: June 6, 2018
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


    
    function Controller($scope, $rootScope, $state, ModulesService, DealsService, TableService, ngToast) {

        //enable load if data for table is not yet fetched
        $scope.loading = true;

        $scope.DATE_FORMAT = 'MM/dd/yyyy';

        $scope.filterOptions = [
            'Active',
            '1-2 months',
            'Mine'
        ];

        $scope.deals = [];

        $scope.fields = {
            essential: [],
            profile: [],
            process: [],
            distribution: [],
            status: []
        };

        $scope.currentPage = 1;
        $scope.pageSize = 10;

        $scope.reverse = false;

        $scope.displayOption = 'Active';        

        $scope.getDeals = function () {
            ModulesService.getAllModuleDocs('deals').then(function (allDeals) {
                $scope.deals = allDeals;
                switch($scope.displayOption) {
                    //display levels 2,3,4,5 only
                    case 'Active': {
                        $scope.deals = $scope.deals.filter(function(aDeal) {
                            return aDeal.profile['Level'] !== '1' && aDeal.profile['Level'] !== '9';
                        });
                    }break;
                    
                    case 'Mine': {
                        $scope.deals = $scope.deals.filter(function(aDeal) {
                            return ((aDeal.profile['Level'] !== '1' && aDeal.profile['Level'] !== '9') &&
                            (aDeal.profile['AWS Resp (Sales) person'] === $rootScope.user.nickname ||
                            aDeal.profile['AWS Resp (Dev) person'] === $rootScope.user.nickname));
                        });
                    }break;
                    //1 - same as active
                    //2 - showing 1 month (up to next month) (active deals that are due before next month)
                    //3 - unclosed deals whose due date is before this month
                    case '1 Month': {
                        var nextMonth = moment().add(1, 'months').endOf('month');
                        //console.log(nextMonth.month());
                        var diff;
                        $scope.deals = $scope.deals.filter(function(aDeal) {
                            //using 'months' in .diff() results to 0 for the next month and next next month
                            //e.g. current month is june, so july 31 is next month
                            //if this is used, deals due on august are also included
                            diff = nextMonth.diff(aDeal.essential['Due Date'], 'months', true);
                            //console.log(diff);
                            return ((aDeal.profile['Level'] !== '1' && aDeal.profile['Level'] !== '9') && 
                            (diff >= 0));
                        });
                    }break;
                    case '2-3 Months': {
                        var nextMonth = moment().add(3, 'months').endOf('month');
                        //console.log(nextMonth.month());
                        var diff;
                        $scope.deals = $scope.deals.filter(function(aDeal) {
                            //use true to get decimal places. this is to avoid having 0s for adjacent months
                            //i.e. next month & next next month
                            diff = nextMonth.diff(aDeal.essential['Due Date'], 'months', true);
                            //console.log(diff);
                            return ((aDeal.profile['Level'] !== '1' && aDeal.profile['Level'] !== '9') && 
                            (diff >= 0 && diff <= 2));
                        });
                    }break;
                    case 'Over Due': {
                        $scope.deals = $scope.deals.filter(function(aDeal) {
                            return aDeal.profile['Level'] !== '1' && 
                            aDeal.profile['Level'] !== '9' && 
                            moment().diff(aDeal.essential['Due Date'], 'days') > 0;
                        });
                    }break;
                    
                    case 'Closed in 2018': {
                        $scope.deals = $scope.deals.filter(function(aDeal) {
                            return aDeal.profile['Level'] === '1' && 
                            moment(aDeal.closedDate).year() === new Date().getFullYear();
                        });
                    }
                }

                //getAllFields();

            }).catch(function (err) {

            }).finally(function() {
                $scope.loading = false;
            });
        }

        $scope.getDeals();

        function getAllFields () {
            ModulesService.getAllModules().then(function (allModules) {
                var category;
                for (var i = 0; i < allModules.length; i++) {
                    //first condition is to make sure that collections that have 'deal' in its name are only processed.
                    if (allModules[i].name.search('deal') !== -1 && allModules[i].name !== 'deals') {
                        category = allModules[i].name.replace('deal', '');
                        $scope.fields[category] = allModules[i].fields;

                        //ewww dirty code 2 for loops, bale 3 nested loops all in all :(
                        //delete properties of each deal which are not shown in the list to avoid its values being searched
                        angular.forEach($scope.fields[category], function(aField) {
                            angular.forEach($scope.deals, function (aDeal) {
                                if(!aField.showInList) {
                                    delete aDeal[category][aField.name];
                                }
                            });
                        });                       
                    }
                }
            }).catch(function (err) {
            });
        }

        getAllFields();
        
        $scope.sortColumn = function (category, fieldName) {
            //$scope.column = category + '.' + fieldName;
            $scope.column = category + "['" + fieldName + "']";
            $scope.reverse = TableService.sortSelectedColumn($scope.reverse, $scope.column).result;
        }
        
        $scope.sortClass = function (category, fieldName) {
            return TableService.sortSelectedClass($scope.reverse, category + "['" + fieldName + "']", $scope.column);
        }

        /* $scope.deleteDeal = function (aDeal) {
            console.log('weee');
            if (confirm('are you sure you want to delete ' + aDeal.essential['Deal Name'] + '?')) {
                DealsService.deleteDeal(aDeal.ID).then(function () {
                    getAllDeals();
                }).catch(function (err) {});
            }
        } */

        $scope.uploadFile = function() {
            const file = $('#newDealFile')[0].files[0];
            DealsService.newDealFile(file).then(function() {
                ngToast.success('File uploaded');
                $scope.getDeals();
            })
            .catch(function(err) {
                ngToast.danger('Error in uploading file');
            });
        }
    }
})();