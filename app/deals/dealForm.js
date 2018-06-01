(function () {
    'use strict';

    angular
        .module('app')
        .controller('DealFormController', Controller);


    function Controller($scope, $rootScope, $state, $stateParams, $filter, ModulesService, DealsService) {
        $scope.dealForm = getInitialDealForm();
        var tempDealForm = getInitialDealForm();
        var DATE_FORMAT = 'MM/dd/yyyy';

        //from jano's code (multiple getModuleByName)
        $scope.profileFields = [];
        $scope.processFields = [];
        $scope.distributionFields = [];
        $scope.statusFields = [];
        $scope.contentFields = [];

        function getAllFields() {
            ModulesService.getModuleByName('dealessential').then(function (response) {
                $scope.essentialFields = response.fields;
                $scope.essentialFieldsId = response._id;
                /* for (var i = 0; i < $scope.essentialFields.length; i++) {
                    $scope.dealForm.essential[$scope.essentialFields[i].name] = ($scope.essentialFields[i].type !== 'number') ? '' : 0;
                } */
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealprofile').then(function (response) {
                $scope.profileFields = response.fields;
                $scope.profileFieldsId = response._id;
                /* for (var i = 0; i < $scope.profileFields.length; i++) {
                    $scope.dealForm.profile[$scope.profileFields[i].name] = ($scope.profileFields[i].type !== 'number') ? '' : 0;
                } */
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealprocess').then(function (response) {
                $scope.processFields = response.fields;
                $scope.processFieldsId = response._id;
                /* for (var i = 0; i < $scope.processFields.length; i++) {
                    $scope.dealForm.process[$scope.processFields[i].name] = ($scope.processFields[i].type !== 'number') ? '' : 0;
                } */
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealdistribution').then(function (response) {
                $scope.distributionFields = response.fields;
                $scope.distributionFieldsId = response._id;
                /* for (var i = 0; i < $scope.distributionFields.length; i++) {
                    $scope.dealForm.distribution[$scope.distributionFields[i].name] = ($scope.distributionFields[i].type !== 'number') ? '' : 0;
                } */
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealstatus').then(function (response) {
                $scope.statusFields = response.fields;
                $scope.statusFieldsId = response._id;
                /* for (var i = 0; i < $scope.statusFields.length; i++) {
                    $scope.dealForm.status[$scope.statusFields[i].name] = ($scope.statusFields[i].type !== 'number') ? '' : 0;
                } */
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealcontent').then(function (response) {
                $scope.contentFields = response.fields;
                $scope.contentFieldsId = response._id;

            }).catch(function (err) {
                alert(err.msg_error);
            });
        }

        getAllFields();
        
        //if there is a parameter, it means that a deal is going to be updated
        if ($stateParams.ID !== '') {
            //get one then store to $scope.dealForm;
            DealsService.getDealById($stateParams.ID).then(function(aDeal) {
                $scope.dealForm = aDeal;

                //explicitly convert dates of Due Date, Duration (Start) & Duration (End) to date objects
                $scope.dealForm.essential['Due Date'] = new Date($scope.dealForm.essential['Due Date']);
                $scope.dealForm.profile['Duration (Start)'] = new Date($scope.dealForm.profile['Duration (Start)']);
                $scope.dealForm.profile['Duration (End)'] = new Date($scope.dealForm.profile['Duration (End)']);

             }).catch(function() {
                $scope.message = 'Cannot find the deal';
            });
            /**
             * if function to convert date inputs to datestrings during submit is working,
             * process $scope.dealForm so that the date strings are converted to date objects
             * */
        }

        $scope.submit = function () {
            /**
             * copy the object to a local variable, then use the local variable to manipulate 
             * do not use = because this is a reference; meaning any changes on one affects the other 
             * tempDealForm = $scope.dealForm; ---> X
             */


            //use Object.assign(target, source) instead
            Object.assign(tempDealForm, $scope.dealForm);

            //format date inputs to a date string
            /**
             * 2 ways to format:
             * 1. use document.getElementById().value; this format is yyyy-MM-dd
             * 2. use Angular's $filter('date')(date, DATE_FORMAT); format depends on DATE_FORMAT variable
             */       
            //explicitly convert dates of Due Date, Duration (Start) & Duration (End) to datestring of prescribed format
            tempDealForm.essential['Due Date'] = $filter('date')(tempDealForm.essential['Due Date'], DATE_FORMAT);
            tempDealForm.profile['Duration (Start)'] = $filter('date')(tempDealForm.profile['Duration (Start)'], DATE_FORMAT);
            tempDealForm.profile['Duration (End)'] = $filter('date')(tempDealForm.profile['Duration (End)'], DATE_FORMAT);

            console.log(tempDealForm);

            if (tempDealForm._id === undefined) {
                DealsService.addDeal(tempDealForm)
                .then(function() {
                    $state.transitionTo('dealList');
                })
                .catch(function(err) {
    
                });
            } else {
                DealsService.updateDeal(tempDealForm)
                .then(function() {
                    $state.transitionTo('dealList');
                })
                .catch(function() {
    
                });
            }            
        }

        $scope.tryFunction = function () {
            var object = {
                "ID":"D8ELQ", 
                "ProjectName":"Dev B",
                "Client":"TI",
            };
        }

        //do not initialize dates to the current date since it is not required
        function getInitialDealForm() {
            return {
                essential: {

                },
                profile: {

                },
                process: {

                },
                distribution: {
                    fiscalYear: [new Date().getFullYear(), new Date().getFullYear() + 1],
                    total: {
                        resource: 0,
                        revenue: 0,
                        cm: 0,
                        percentage: 0
                    },
                    average: 0,
                    cm: {},
                    res: {
                        jp: {},
                        gd: {}
                    },
                    rev: {
                        jp: {},
                        gd: {}
                    }
                },
                status: {

                },
                content: {
                    'Main Message': ''
                }
            };
        }
    }
})();