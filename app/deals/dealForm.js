(function () {
    'use strict';

    angular
        .module('app')
        .controller('DealFormController', Controller);


    function Controller($scope, $rootScope, $state, $stateParams, $filter, ModulesService, DealsService) {

        //ng-model for a deal
        $scope.dealForm = getInitialDealForm();

        //working format for two way conversion
        var DATE_FORMAT = 'MM/dd/yyyy';

        //initialize variables for distribution section
        $scope.currentFiscalYear = [];
        $scope.startingMonthYear = new Date();

        //store in arrays to be able to use ng-repeat
        $scope.fields = {
            essential: [],
            profile: [],
            process: [],
            distribution: [],
            status: [],
            content: []
        };

        $scope.validateBlankInputs = function(){
            console.log('glenn');
            //glenn's code to loop category fields if there is required
            var targetCategory = ['profileSection', 'processSection', 'distributionSection', 'statusSection', 'contentSection'];

            for (var a = 0; a < targetCategory.length; a++){
                var categoryInputs = document.getElementById(targetCategory[a]).getElementsByTagName("input");
                var inputLength = categoryInputs.length;
                for (var i = 0; i < inputLength; i++) {
                    if (categoryInputs[i].value === '' && categoryInputs[i].required){
                        $('#'+targetCategory[a]).collapse('show');
                        break;
                    }
                }
            }
        }

        //get the fields arrays of dealessential, dealprofile, dealprocess, dealstatus, and dealcontent
        function getAllFields () {
            ModulesService.getAllModules().then(function (allModules) {
                var category;
                var allModulesLength = allModules.length;
                for (var i = 0; i < allModulesLength; i++) {
                    //first condition is to make sure that collections that have 'deal' in its name are only processed.
                    if (allModules[i].name.search('deal') !== -1 && allModules[i].name !== 'deals') {
                        category = allModules[i].name.replace('deal', '');
                        $scope.fields[category] = allModules[i].fields;
                    }
                }
            }).catch(function (err) {
            });
        }

        getAllFields();
        
        //if there is a parameter, it means that a deal is going to be updated
        if ($stateParams.ID !== '') {
            //get one then store to $scope.dealForm;
            DealsService.getDealById($stateParams.ID).then(function(aDeal) {
                //use true to convert datestrings to date objects
                $scope.dealForm = preProcess(aDeal, true);

             }).catch(function() {
                $scope.message = 'Cannot find the deal';
            });
        }

        $scope.submit = function () {
            //use Object.assign(target, source) instead
            var tempDealForm = {};
            Object.assign(tempDealForm, $scope.dealForm);            

            //use false to convert date objects to datestrings
            try {
                tempDealForm = preProcess(tempDealForm, false);
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
            } catch (e) {
                $scope.message = e.message;
            }
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

        $scope.getCurrentFiscalYear = function () {
            //reset the array
            $scope.currentFiscalYear = [];
            
            //assign to the current date if input is null
            if ($scope.startingMonthYear === null) {
                $scope.startingMonthYear = new Date();
            }
            //+ 1 since javascript months starts with 0
            var setMonth = $scope.startingMonthYear.getMonth() + 1; 
            var setYear = $scope.startingMonthYear.getFullYear();
            var temp = '';
            var i;
            
            i = setMonth;
            do {
                //next year
                if (i < setMonth) {
                    temp = (i < 10) ? ('0' + i + '/' + (setYear + 1)) : (i + '/' + (setYear + 1));
                //current year
                } else {
                    temp = (i < 10) ? ('0' + i + '/' + setYear) : (i + '/' + setYear);
                }

                $scope.currentFiscalYear.push(temp);

                //use modulo to set i as 1 instead of 13
                i = (i % 12 === 0) ? 1 : (i + 1);
            } while (i != setMonth);
        }

        $scope.getCurrentFiscalYear();

        function preProcess(dealForm, isLoaded) {
            console.log('jeremy');
            var tempObject = dealForm;

            //perform this during submit
            if (!isLoaded && tempObject.profile['Duration (Start)'] > tempObject.profile['Duration (End)']) {
                //throw an error if start > end
                throw new Error('End date must be greater than or equal to the start date');
            }

            //use $scope.fields and iterate each array
            angular.forEach($scope.fields, function(fields, category) {
                console.log(category);
                var i, currentField, arrayLength = fields.length;
                for(i = 0; i < arrayLength; i++) {
                    currentField = $scope.fields[category][i];
                    //check the input type and process only dates
                    if(currentField.type === 'date') {
                        //if it is loaded from database, convert the datestring to date object
                        //else, convert the date object to a datestring with the prescribed format
                        tempObject[category][currentField.name] = (isLoaded) ? 
                        new Date(tempObject[category][currentField.name]) : 
                        $filter('date')(tempObject[category][currentField.name], DATE_FORMAT);
                    }
                }
                
            });

            return tempObject;
        }

        //returns the field object from the array of specified category
        $scope.getField = function (category, fieldName) {
            return $scope.fields[category].find(function(field) {
                return field.name === fieldName;
            });
        }

    }
})();