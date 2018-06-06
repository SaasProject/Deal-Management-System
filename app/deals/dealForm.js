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

        //default of distribution
        var distributionStrings = {
            direct: 'Direct to Client',
            middle1: 'To Middleman',
            middle2: 'Middleman to Client'
        }
        $scope.contracts = [distributionStrings.direct];

        $scope.validateBlankInputs = function(){
            console.log('glenn');
            //glenn's code to loop category fields if there is required
            var targetCategory = ['profileSection', 'processSection', 'distributionSection', 'statusSection', 'contentSection'];

            for (var a = 0; a < targetCategory.length; a++){
                var categoryInputs = document.getElementById(targetCategory[a]).querySelectorAll('input,textarea,select');
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

                console.log($scope.dealForm);
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
                //console.log(e);
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
                    /* total: {
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
                    } */
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

            //perform operations on variables that you can explicitly determine
            //during load
            if (isLoaded) {
                //set the sow scheme (for the distribution table)
                $scope.setContracts(tempObject.process['SOW Scheme']);
            //during submit
            } else {
                //explicitly set SOW scheme (because default selected options is not working) to Direct
                if (tempObject.process['SOW Scheme'] === null || tempObject.process['SOW Scheme'] === undefined) {
                    tempObject.process['SOW Scheme'] = 'Direct';
                }
                
                //throw error if start date > end date
                if(tempObject.profile['Duration (Start)'] > tempObject.profile['Duration (End)']) {
                    throw new Error('End date must be greater than or equal to the start date');
                }

                //delete the other to avoid being included in computation and being stored in database
                /* if (tempObject.process['SOW Scheme'] === 'Indirect') {
                    delete tempObject.distribution[distributionStrings.direct];
                } else {
                    delete tempObject.distribution[distributionStrings.middle1];
                    delete tempObject.distribution[distributionStrings.middle2];
                } */
            }

            //use $scope.fields and iterate each array
            angular.forEach($scope.fields, function(fields, category) {
                console.log(category);
                var i, currentField, arrayLength = fields.length;
                for(i = 0; i < arrayLength; i++) {
                    currentField = $scope.fields[category][i];

                    //not working, workaround is to use validateBlankInputs() during ng-click
                   /*  if(!isLoaded && currentField.required && 
                        (tempObject[category][currentField.name] === '' ||
                        tempObject[category][currentField.name] === null || 
                        tempObject[category][currentField.name] === undefined)) {
                            throw {REQUIRED_ERROR: true, category: category};
                    } */

                    
                    //preprocess when loading
                    if (isLoaded) {
                        if(currentField.type === 'date' && tempObject[category][currentField.name] !== null) {
                            tempObject[category][currentField.name] = new Date(tempObject[category][currentField.name]);
                        }
                    //preprocess during submit
                    } else {
                        //do not store keys with null values
                        if (tempObject[category][currentField.name] === null) {
                            delete tempObject[category][currentField.name];
                        }

                        if(currentField.type === 'date' && tempObject[category][currentField.name] !== null) {
                            tempObject[category][currentField.name] = $filter('date')(tempObject[category][currentField.name], DATE_FORMAT);
                        } 
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

        $scope.setContracts = function (sowScheme) {
            //$scope.contracts = [];
            
            //why is it not working huhu
            //always else huhu
            if(sowScheme === 'Indirect') {
                $scope.contracts = [distributionStrings.middle1, distributionStrings.middle2];
            } else {                
                $scope.contracts = [distributionStrings.direct];
            }
        }

    }
})();