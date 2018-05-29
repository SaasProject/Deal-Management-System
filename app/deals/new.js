(function(){
    'use strict';

    angular
        .module('app')
        .controller('NewDealController', Controller);

    
    function Controller($scope, $rootScope, $state, $filter) {
        $scope.dealForm = getInitialDealForm();
        var tempDealForm = getInitialDealForm();

        var DATE_FORMAT = 'dd/MM/yyyy';

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
                    fiscalYear: {},
                    total: {
                        resource: 0,
                        revenue: 0,
                    },
                    average: 0,
                    cm: 0
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

        //rough code
        function getMonthsOfFiscalYear() {
            var fiscalYear = {};
            var currentYear = new Date().getFullYear();
            var currentYearMonths = ['May', 'June', 'July']
            fiscalYear[currentYear] = [];
            
            var perMonth = {
                resource: { 
                    jp: 0,
                    gd: 0
                },
                revenue: {
                    jp: 0,
                    gd: 0
                },
                cm: 0
            }
        }
    }
})();