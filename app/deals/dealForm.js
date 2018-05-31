(function () {
    'use strict';

    angular
        .module('app')
        .controller('DealFormController', Controller);


    function Controller($scope, $rootScope, $state, $stateParams, $filter, ModulesService, DealsService) {
        $scope.dealForm = getInitialDealForm();
        var tempDealForm = getInitialDealForm();
        $scope.profileFields = [];
        $scope.processFields = [];
        $scope.distributionFields = [];
        $scope.statusFields = [];

        //hard code level and steps. steps depend on the selected level
        $scope.levels = [
            {
                level: 9,
                steps: [
                    9.1
                ]
            },
            {
                level: 5,
                steps: [
                    5.2,
                    5.1
                ]
            },
            {
                level: 4,
                steps: [
                    4.2,
                    4.1
                ]
            }
        ];

        $scope.totalRES;

        var DATE_FORMAT = 'dd/MM/yyyy';

        function getAllFields() {
            ModulesService.getModuleByName('dealessential').then(function (response) {
                $scope.essentialFields = response.fields;
                $scope.essentialFieldsId = response._id;
                for (var i = 0; i < $scope.essentialFields.length; i++) {
                    $scope.dealForm.essential[$scope.essentialFields[i].name] = ($scope.essentialFields[i].type !== 'number') ? '' : 0;
                }
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealprofile').then(function (response) {
                $scope.profileFields = response.fields;
                $scope.profileFieldsId = response._id;
                for (var i = 0; i < $scope.profileFields.length; i++) {
                    $scope.dealForm.profile[$scope.profileFields[i].name] = ($scope.profileFields[i].type !== 'number') ? '' : 0;
                }
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealprocess').then(function (response) {
                $scope.processFields = response.fields;
                $scope.processFieldsId = response._id;
                for (var i = 0; i < $scope.processFields.length; i++) {
                    $scope.dealForm.process[$scope.processFields[i].name] = ($scope.processFields[i].type !== 'number') ? '' : 0;
                }
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealdistribution').then(function (response) {
                $scope.distributionFields = response.fields;
                $scope.distributionFieldsId = response._id;
                for (var i = 0; i < $scope.distributionFields.length; i++) {
                    $scope.dealForm.distribution[$scope.distributionFields[i].name] = ($scope.distributionFields[i].type !== 'number') ? '' : 0;
                }
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealstatus').then(function (response) {
                $scope.statusFields = response.fields;
                $scope.statusFieldsId = response._id;
                for (var i = 0; i < $scope.statusFields.length; i++) {
                    $scope.dealForm.status[$scope.statusFields[i].name] = ($scope.statusFields[i].type !== 'number') ? '' : 0;
                }
            }).catch(function (err) {
                alert(err.msg_error);
            });
            ModulesService.getModuleByName('dealcontent').then(function (response) {
                $scope.contentFields = response.fields;
                $scope.contentFieldsId = response._id;

            }).catch(function (err) {
                alert(err.msg_error);
            });
        };

        getAllFields();
        
        //if there is a parameter, it means that a deal is going to be updated
        if ($stateParams.ID !== null) {
            //get one then store to $scope.dealForm;
            DealsService.getDealById($stateParams.ID).then(function(aDeal) {
                $scope.dealForm = aDeal;
            }).catch(function() {
                $scope.message = 'Cannot find the deal';
            });
            /**
             * if function to convert date inputs to datestrings during submit is working,
             * process $scope.dealForm so that the date strings are converted to date objects
             * */
        }

        //use this to convert date inputs to a datestring with the prescribed format
        $scope.formatDateInput = function (date) {
            return $filter('date')(date, DATE_FORMAT);
        }

        //use this to convert datestring to a date object
        $scope.convertDateString = function (date) {
            return new Date(date);
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
                        
            console.log(tempDealForm);
            
            if (tempDealForm._id === undefined) {
                DealsService.addDeal(tempDealForm)
                .then(function(){
                    $state.transitionTo('dealList');
                })
                .catch(function(err){
    
                });
            } else {
                DealsService.updateDeal(tempDealForm)
                .then(function(){
                    $state.transitionTo('dealList');
                })
                .catch(function(){
    
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