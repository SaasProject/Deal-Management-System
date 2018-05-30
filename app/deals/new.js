(function(){
    'use strict';

    angular
        .module('app')
        .controller('NewDealController', Controller);

    
    function Controller($scope, $rootScope, $state, $filter, ModulesService) {
        $scope.dealForm = getInitialDealForm();
        var tempDealForm = getInitialDealForm();
        //determine current year for distribution
        var currentYear = new Date().getFullYear();

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

        function getAllFields(){
			
		  ModulesService.getModuleByName('dealprofile').then(function(response){
				$scope.profileFields = response.fields;
                $scope.profileFieldsId = response._id;
				$scope.profileFieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
          ModulesService.getModuleByName('dealprocess').then(function(response){
				$scope.processFields = response.fields;
                $scope.processFieldsId = response._id;
				$scope.processFieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
          ModulesService.getModuleByName('dealdistribution').then(function(response){
				$scope.distributionFields = response.fields;
                $scope.distributionFieldsId = response._id;
				$scope.distributionFieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
          ModulesService.getModuleByName('dealstatus').then(function(response){
				$scope.statusFields = response.fields;
                $scope.statusFieldsId = response._id;
				$scope.statusFieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
          ModulesService.getModuleByName('dealcontent').then(function(response){
				$scope.contentFields = response.fields;
                $scope.contentFieldsId = response._id;
				$scope.contentFieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
        };
        

        //call this function to get all fields when page is loaded
        getAllFields();

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

            //format dueDate, duration (start) & (end), srb date, and sow date to a date string
            /**
             * 2 ways to format:
             * 1. use document.getElementById().value; this format is yyyy-MM-dd
             * 2. use Angular's $filter('date')(date, DATE_FORMAT); format depends on DATE_FORMAT variable
             */
            tempDealForm.dueDate = $scope.formatDateInput(tempDealForm.dueDate);
            tempDealForm.profile.duration.start = $scope.formatDateInput(tempDealForm.profile.duration.start);
            tempDealForm.profile.duration.end = $scope.formatDateInput(tempDealForm.profile.duration.end);
            tempDealForm.process.srb.date = $scope.formatDateInput(tempDealForm.process.srb.date);
            tempDealForm.process.sow.date = $scope.formatDateInput(tempDealForm.process.sow.date);
            console.log($scope.dealForm.profile.duration);
            console.log(tempDealForm);
        }

        //do not initialize dates to the current date since it is not required
        function getInitialDealForm() {
            return {
                name: '',
                //dueDate: new Date(),
                dueDate: '',
                profile: {
                    country: '',
                    division: '',
                    client: {
                        clientID: '',
                        clientResp: ''
                    },
                    service: '',
                    level: '',
                    step: '',
                    type: '',
                    confidence: '',
                    resourceSize: {
                        mm: 0,
                        fte: 0
                    },
                    revenue: 0,
                    cm: 0,
                    duration: {
                        //start: new Date(),
                        //end: new Date()
                        start: '',
                        end: ''
                    },
                    awsResp: {
                        sales: '',
                        dev: ''
                    },
                    keyAssignment: '',
                    remark: ''
                },
                process: {
                    sow: {
                        scheme: '',
                        number: '',
                        //date: new Date(),
                        date: '',
                        status: ''
                    },
                    srb: {
                        number: '',
                        //date: new Date(),
                        date: '',
                        status: ''
                    }
                },
                distribution: {
                    fiscalYear: [currentYear, currentYear + 1],
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
                    dependency: '',
                    action: '',
                    status: '',
                    stepToClose: ''
                },
                content: ''
            };
        }
    }
})();