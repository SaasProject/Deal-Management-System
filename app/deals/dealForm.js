(function () {
    'use strict';

    angular
        .module('app')
        .controller('DealFormController', Controller);


    function Controller($scope, $rootScope, $state, $stateParams, $filter, ModulesService, DealsService) {

        //ng-model for a deal
        $scope.dealForm = getInitialDealForm();

        //working format for two way conversion
        var DATE_FORMAT = 'yyyy-MM-dd';

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
            intra: 'Intra-Company'
        };

        $scope.contracts = [distributionStrings.direct];

        //store total computations outside of dealForm.distribution to avoid registering changes in $scope.$watch
        //set this to dealForm.distribution[dealForm.process['SOW Scheme']].total during submit
        $scope.total = {};
        //initialize $scope.total based from distribution strings
        $scope.total[distributionStrings.direct] = {};
        $scope.total[distributionStrings.intra] = {};

        $scope.validateBlankInputs = function () {
            console.log('glenn');
            //glenn's code to loop category fields if there is required
            var targetCategory = ['profileSection', 'processSection', 'distributionSection', 'statusSection', 'contentSection'];

            for (var a = 0; a < targetCategory.length; a++) {
                var categoryInputs = document.getElementById(targetCategory[a]).querySelectorAll('input,textarea,select');
                for (var i = 0; i < categoryInputs.length; i++) {
                    if (categoryInputs[i].value === '' && categoryInputs[i].required) {
                        $('#' + targetCategory[a]).collapse('show');
                        break;
                    }
                }
            }
        }

        //get the fields arrays of dealessential, dealprofile, dealprocess, dealstatus, and dealcontent
        function getAllFields() {
            ModulesService.getAllModules().then(function (allModules) {
                var category;
                for (var i = 0; i < allModules.length; i++) {
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
            DealsService.getDealById($stateParams.ID).then(function (aDeal) {
                //use true to convert datestrings to date objects
                $scope.dealForm = preProcess(aDeal, true);

                console.log($scope.dealForm);
            }).catch(function () {
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
                        .then(function () {
                            $state.transitionTo('dealList');
                        })
                        .catch(function (err) {

                        });
                } else {
                    DealsService.updateDeal(tempDealForm)
                        .then(function () {
                            $state.transitionTo('dealList');
                        })
                        .catch(function () {

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
                    /*
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
                if (tempObject.profile['Duration (Start)'] > tempObject.profile['Duration (End)']) {
                    throw new Error('End date must be greater than or equal to the start date');
                }

                //set $scope.total to distribution[total]
                tempObject.distribution['total'] = $scope.total;

                //set $scope.total to dealForm.distribution.total

                //delete the other to avoid being included in computation and being stored in database
                //kung hindi pwde sabay ang direct & indirect, uncomment this
                /* if (tempObject.process['SOW Scheme'] === 'Indirect') {
                    delete tempObject.distribution[distributionStrings.direct];
                } else {
                    delete tempObject.distribution[distributionStrings.middle1];
                    delete tempObject.distribution[distributionStrings.middle2];
                } */
            }

            //use $scope.fields and iterate each array
            angular.forEach($scope.fields, function (fields, category) {
                var i, currentField;
                for (i = 0; i < fields.length; i++) {
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
                        if (currentField.type === 'date' && tempObject[category][currentField.name] !== null) {
                            tempObject[category][currentField.name] = new Date(tempObject[category][currentField.name]);
                        }
                        //preprocess during submit
                    } else {
                        //do not store keys with null values
                        if (tempObject[category][currentField.name] === null) {
                            delete tempObject[category][currentField.name];
                        }

                        if (currentField.type === 'date' && tempObject[category][currentField.name] !== null) {
                            tempObject[category][currentField.name] = $filter('date')(tempObject[category][currentField.name], DATE_FORMAT);
                        }
                    }
                }

            });

            return tempObject;
        }

        //returns the field object from the array of specified category
        $scope.getField = function (category, fieldName) {
            return $scope.fields[category].find(function (field) {
                return field.name === fieldName;
            });
        }

        $scope.setContracts = function (sowScheme) {
            //$scope.contracts = [];

            //why is it not working huhu
            //always else huhu
            if (sowScheme === 'Intra-Company') {
                $scope.contracts = [distributionStrings.intra, distributionStrings.direct];
            } else {
                $scope.contracts = [distributionStrings.direct];
            }
        }

        // place computeDistribution in $scope.setContracts because it doesnt work here :(
        /* $scope.$watch("dealForm.process.['SOW Scheme']", function() {
            computeDistribution();
        }); */
        //use true to register changes in values
        $scope.$watch('dealForm.distribution', function () {
            //if distribution is empty, do not compute
            if (!angular.equals($scope.dealForm.distribution, {})) {
                computeDistribution();
            }
        }, true);

        /**
             * nakakapagcompute na ng total resource. considered na lahat ng months ng both jp & gd.
             * kaso kapag nagswitch yung SOW Scheme, magrerecompute sya at maooverwrite yung lumang totals
             * e.g. put some values when SOW Scheme is undefined/Direct. kapag magsswitch,
             * hindi nakasave sa variable yung total ni direct. magrerecompute ulit sya kapag naging direct ulit
             * yung sow scheme, which is inefficient
             */

        function computeDistribution() {
            //console.log($scope.dealForm.distribution);
            //use variables like sumRes as temporary sum
            var i, resJP, resGD, revJP, revGD, cm, resSum, revSum, cmSum;
            //for direct or indirect
            for (i = 0; i < $scope.contracts.length; i++) {
                //console.log($scope.dealForm.distribution[$scope.contracts[i]].res);
                //reset per contract
                resJP = [], resGD = [], revJP = [], revGD = [], cm = [];
                resSum = 0, revSum = 0, cmSum = 0;
                //compute total resource
                if ($scope.dealForm.distribution[$scope.contracts[i]] !== undefined) {
                    /**
                     * check if not undefined to avoid displaying errors
                     * for res & rev, need to check both jp & gd if not undefined to avoid errors
                     * */
                    //use object.values since they are all integers
                    //check resources of JP
                    if ($scope.dealForm.distribution[$scope.contracts[i]].res !== undefined) {
                        if ($scope.dealForm.distribution[$scope.contracts[i]].res.jp !== undefined) {
                            resJP = Object.values($scope.dealForm.distribution[$scope.contracts[i]].res.jp);
                        }

                        //check resources of GD
                        if ($scope.dealForm.distribution[$scope.contracts[i]].res.gd !== undefined) {
                            resGD = Object.values($scope.dealForm.distribution[$scope.contracts[i]].res.gd);
                        }

                        //compute total resource
                        if (resJP.length > 0 || resGD.length > 0) {
                            resSum = resJP.concat(resGD).reduce(function (total, value) {
                                return (value !== undefined && value !== null) ? total + value : total + 0;
                            });
                        }
                    }

                    if ($scope.dealForm.distribution[$scope.contracts[i]].rev !== undefined) {
                        //check revenue of JP
                        if ($scope.dealForm.distribution[$scope.contracts[i]].rev.jp !== undefined) {
                            revJP = Object.values($scope.dealForm.distribution[$scope.contracts[i]].rev.jp);
                        }
                        //check revenue of GD
                        if ($scope.dealForm.distribution[$scope.contracts[i]].rev.gd !== undefined) {
                            revGD = Object.values($scope.dealForm.distribution[$scope.contracts[i]].rev.gd);
                        }

                        //compute total revenue
                        if (revJP.length > 0 || revGD.length > 0) {
                            revSum = revJP.concat(revGD).reduce(function (total, value) {
                                return (value !== undefined && value !== null) ? total + value : total + 0;
                            });
                        }
                    }

                    //compute average
                    var average = revSum / resSum;
                    //check average value
                    /* if(isNaN(average) || average === Infinity) {
                        average = 0;
                    } */

                    //check cm
                    if ($scope.dealForm.distribution[$scope.contracts[i]].cm !== undefined) {
                        cm = Object.values($scope.dealForm.distribution[$scope.contracts[i]].cm);

                        //compute total cm
                        if (cm.length > 0) {
                            cmSum = cm.reduce(function (total, value) {
                                return (value !== undefined && value !== null) ? total + value : total + 0;
                            });
                        }
                    }

                    //console.log(resSum, revSum, cmSum);

                    $scope.total[$scope.contracts[i]].resource = (resSum !== null) ? resSum : 0;
                    $scope.total[$scope.contracts[i]].revenue = (revSum !== null) ? revSum : 0;
                    //((revSum / resSum) !== NaN) does not work

                    $scope.total[$scope.contracts[i]].average = average;
                    $scope.total[$scope.contracts[i]].cm = (cmSum !== null) ? cmSum : 0;
                    //console.log($scope.total);
                }
            }
        }
    }
})();