(function () {
    'use strict';

    angular
        .module('app')
        .controller('DealFormController', Controller);


    function Controller($scope, $rootScope, $state, $stateParams, $filter, ModulesService, DealsService, ClientService, ngToast) {

        //ng-model for a deal
        $scope.dealForm = {
            essential: {},
            profile: {},
            process: {},
            distribution: {},
            status: {},
            content: {}
        };

        //working format for two way conversion
        $scope.DATE_FORMAT = 'yyyy/MM/dd';

        //initialize clients array
        $scope.clients = [];

        //initialize users array
        //initialize business units array
        $scope.users = [];
        $scope.businessUnits = [];

        //initialize variables for distribution section
        $scope.currentMonths = [];
        $scope.startingMonthYear = new Date();
        //this will not change even if startingMonthYear is changed
        //starting day is april 01, ending month is march 31
        //even though display format is yyyy/MM/dd, use yyyy-MM-dd in conversion or computation of dates since the latter is a standard format
        $scope.currentFiscalYear = {
            currentYear: $scope.startingMonthYear.getFullYear() + '-04-01',
            nextYear: ($scope.startingMonthYear.getFullYear() + 1) + '-03-31',
            years: $scope.startingMonthYear.getFullYear() + '-' + ($scope.startingMonthYear.getFullYear() + 1)
        };

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

        //variables for parsing excel file
        var rABS = true;
        $scope.showUpload = true;

        $scope.contracts = [distributionStrings.direct];

        //store total computations outside of dealForm.distribution to avoid registering changes in $scope.$watch
        //set this to dealForm.distribution[dealForm.process['SOW Scheme']].total during submit
        $scope.total = {};
        //initialize $scope.total based from distribution strings
        $scope.total[distributionStrings.direct] = {};
        $scope.total[distributionStrings.direct][$scope.currentFiscalYear.years] = {};
        $scope.total[distributionStrings.intra] = {};
        $scope.total[distributionStrings.intra][$scope.currentFiscalYear.years] = {};

        /* $scope.validateBlankInputs = function () {
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
        } */

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

        function getClients() {
            ClientService.getAllClients().then(function (clients) {
                $scope.clients = clients;
            }).catch(function () {

            });
        }

        getClients();

        function getAllUsers() {
            ModulesService.getAllModuleDocs('users').then(function (users) {
                $scope.users = users.filter(function (aUser) {
                    return aUser.role !== 'Admin';
                });
            }).catch(function (err) {

            });
        }

        getAllUsers();

        function getAllBUs() {
            ModulesService.getAllModuleDocs('businessunits').then(function (businessUnits) {
                $scope.businessUnits = businessUnits;
            }).catch(function (err) {

            });
        }

        getAllBUs();

        //if there is a parameter, it means that a deal is going to be updated
        if ($stateParams.ID !== '') {
            //get one then store to $scope.dealForm;
            DealsService.getDealById($stateParams.ID).then(function (aDeal) {
                //use true to convert datestrings to date objects
                $scope.dealForm = preProcess(aDeal, true);
                $scope.showUpload = false;
                console.log($scope.dealForm);
            }).catch(function () {
                //$scope.message = 'Cannot find the deal';
                $scope.showUpload = false;
                ngToast.danger('Cannot find the deal');
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
                            ngToast.success('Deal added');
                            $state.transitionTo('dealList');
                        })
                        .catch(function (err) {

                        });
                } else {
                    DealsService.updateDeal(tempDealForm)
                        .then(function () {
                            ngToast.success('Deal updated');
                            $state.transitionTo('dealList');
                        })
                        .catch(function () {

                        });
                }
            } catch (e) {
                //console.log(e);
                //$scope.message = e.message;
                ngToast.danger(e.message);
            }
        }

        $scope.$watch('startingMonthYear', function () {
            //reset the array
            $scope.currentMonths = [];

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
                    temp = (i < 10) ? ((setYear + 1) + '/' + '0' + i) : ((setYear + 1) + '/' + i);
                    //current year
                } else {
                    temp = (i < 10) ? (setYear + '/' + '0' + i) : (setYear + '/' + i);
                }

                $scope.currentMonths.push(temp);

                //use modulo to set i as 1 instead of 13
                i = (i % 12 === 0) ? 1 : (i + 1);
            } while (i != setMonth);
        });

        //$scope.getCurrentDisplay();

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
                    tempObject.process['SOW Scheme'] = 'Direct to Customer';
                }

                //throw error if start date > end date
                if (tempObject.profile['Duration (Start)'] > tempObject.profile['Duration (End)']) {
                    throw new Error('End date must be greater than or equal to the start date');
                }

                if(tempObject.essential['Due Date'] > tempObject.process['SOW Date']) {
                    throw new Error('Due date must be less than or equal to the SOW Date');
                }

                //set $scope.total to distribution['total']
                tempObject.distribution['total'] = $scope.total;
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
                        if (currentField.type === 'date' && tempObject[category][currentField.name] !== null && tempObject[category][currentField.name] !== undefined) {
                            const tempDate = tempObject[category][currentField.name].replace(/\//g, '-');
                            tempObject[category][currentField.name] = new Date(tempDate);
                        }
                        //preprocess during submit
                    } else {
                        //do not store keys with null values
                        if (tempObject[category][currentField.name] === null) {
                            delete tempObject[category][currentField.name];
                        }

                        if (currentField.type === 'date' && tempObject[category][currentField.name] !== null) {
                            tempObject[category][currentField.name] = $filter('date')(tempObject[category][currentField.name], $scope.DATE_FORMAT);
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
            if (sowScheme === 'Transfer Pricing to UBICOM') {
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
            var i, resJP, resGD, revJP, revGD, cm, resSum, revSum, cmSum, forCompute, editedProp;
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
                            forCompute = {};
                            Object.assign(forCompute, $scope.dealForm.distribution[$scope.contracts[i]].res.jp);
                            for (var prop in forCompute) {
                                //prop is assumed to have yyyy/MM format (from $scope.getCurrentDisplay())
                                //to properly use moment, convert it to yyyy-MM-01 (01 since date is not given)
                                editedProp = prop.replace(/\//, '-') + '-01';
                                if (!moment(editedProp)
                                    .isBetween($scope.currentFiscalYear.currentYear,
                                    $scope.currentFiscalYear.nextYear) || forCompute[prop] === null) {

                                    delete forCompute[prop];
                                }
                            }
                            resJP = Object.values(forCompute);
                        }

                        //check resources of GD
                        if ($scope.dealForm.distribution[$scope.contracts[i]].res.gd !== undefined) {
                            forCompute = {};
                            Object.assign(forCompute, $scope.dealForm.distribution[$scope.contracts[i]].res.gd);
                            for (var prop in forCompute) {
                                editedProp = prop.replace(/\//, '-') + '-01';
                                if (!moment(editedProp)
                                    .isBetween($scope.currentFiscalYear.currentYear,
                                    $scope.currentFiscalYear.nextYear) || forCompute[prop] === null) {

                                    delete forCompute[prop];
                                }
                            }
                            resGD = Object.values(forCompute);
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
                            forCompute = {};
                            Object.assign(forCompute, $scope.dealForm.distribution[$scope.contracts[i]].rev.jp);
                            for (var prop in forCompute) {
                                editedProp = prop.replace(/\//, '-') + '-01';
                                if (!moment(editedProp)
                                    .isBetween($scope.currentFiscalYear.currentYear,
                                    $scope.currentFiscalYear.nextYear) || forCompute[prop] === null) {

                                    delete forCompute[prop];
                                }
                            }
                            revJP = Object.values(forCompute);
                        }
                        //check revenue of GD
                        if ($scope.dealForm.distribution[$scope.contracts[i]].rev.gd !== undefined) {
                            forCompute = {};
                            Object.assign(forCompute, $scope.dealForm.distribution[$scope.contracts[i]].rev.gd);
                            for (var prop in forCompute) {
                                editedProp = prop.replace(/\//, '-') + '-01';
                                if (!moment(editedProp)
                                    .isBetween($scope.currentFiscalYear.currentYear,
                                    $scope.currentFiscalYear.nextYear) || forCompute[prop] === null) {

                                    delete forCompute[prop];
                                }
                            }
                            revGD = Object.values(forCompute);
                        }

                        //compute total revenue
                        if (revJP.length > 0 || revGD.length > 0) {
                            revSum = revJP.concat(revGD).reduce(function (total, value) {
                                return (value !== undefined && value !== null) ? total + value : total + 0;
                            });
                        }
                    }

                    //check average value
                    /* if(isNaN(average) || average === Infinity) {
                        average = 0;
                    } */

                    //check cm
                    if ($scope.dealForm.distribution[$scope.contracts[i]].cm !== undefined) {
                        forCompute = {};
                        Object.assign(forCompute, $scope.dealForm.distribution[$scope.contracts[i]].cm);
                        for (var prop in forCompute) {
                            editedProp = prop.replace(/\//, '-') + '-01';
                            if (!moment(editedProp)
                                .isBetween($scope.currentFiscalYear.currentYear,
                                $scope.currentFiscalYear.nextYear) || forCompute[prop] === null) {

                                delete forCompute[prop];
                            }
                        }
                        cm = Object.values(forCompute);

                        //compute total cm
                        if (cm.length > 0) {
                            cmSum = cm.reduce(function (total, value) {
                                return (value !== undefined && value !== null) ? total + value : total + 0;
                            });
                        }
                    }

                    //console.log(resSum, revSum, cmSum);

                    $scope.total[$scope.contracts[i]][$scope.currentFiscalYear.years].resource = (resSum !== null) ? resSum : 0;
                    $scope.total[$scope.contracts[i]][$scope.currentFiscalYear.years].revenue = (revSum !== null) ? revSum : 0;
                    //((revSum / resSum) !== NaN) does not work

                    $scope.total[$scope.contracts[i]][$scope.currentFiscalYear.years].average = revSum / resSum;
                    $scope.total[$scope.contracts[i]][$scope.currentFiscalYear.years].cm = (cmSum !== null) ? cmSum : 0;
                    $scope.total[$scope.contracts[i]][$scope.currentFiscalYear.years].percent = (cmSum / revSum) * 100;
                    //console.log($scope.total);
                }
            }
        }

        //get the latest change date for the specified level from $scope.dealForm['Change History'] array
        //since all changes are pushed into the change history, get the last index
        $scope.getLatestChangeDate = function(level) {
            if($scope.dealForm['Change History'] !== undefined) {
                var tempArray = [];
                tempArray = $scope.dealForm['Change History'].filter(function(change) {
                    return change.level === level;
                });
                return (tempArray[tempArray.length - 1]) ? tempArray[tempArray.length - 1].date : '';
            } else {
                return '';
            }
        }

        function processExcel(e) {
            var spreadsheet, j, rows;
            var tempObject = {
                essential: {},
                profile: {},
                process: {},
                distribution: {},
                status: {},
                content: {}
            };
            var numberFields = ['Resource Size (MM)', 'Resource Size (FTE)', 'Revenue', 'CM'];

            var files = e.target.files;
            var f = files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                if (!rABS) {
                    data = new Uint8Array(data);
                }
                spreadsheet = XLSX.read(data, { type: (rABS) ? 'binary' : 'array' });

                //delete 'options' sheet (this sheet is for dropdown options which MUST be the same as the deal form)
                spreadsheet['SheetNames'].splice(spreadsheet['SheetNames'].indexOf('options'), 1);

                //console.log('spreadsheet', spreadsheet);
                //get the contents of each sheet (each category)
                for (var i = 0; i < spreadsheet['SheetNames'].length; i++) {
                    //initialize variables
                    //get the keys which represents the cells
                    rows = Object.keys(spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]);

                    //check the rows, skip the sheet if it is empty (e.g. distribution table may be empty for now)
                    if(rows.length === 0) {
                        continue;
                    }

                    j = 1;
                    tempObject[spreadsheet['SheetNames'][i]] = {};
                    do {
                        //store cell's value if not undefined
                        if (spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['B' + j] !== undefined) {
                            /**
                                ['A' + j] & ['B' + j] will result to the cell then the 'w' property is the value (formatted text) of that cell
                                ['A' + j].w is the field from the template, ['B' + j].w is the value inputted by the user
                                example of object structure
                                spreadsheet['SheetNames'][i] = 'profile'
                                spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['A' + j].w = 'Country'
                                spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['B' + j].w = 'PH'
                                the difference between v & w is that the v is the true value (if number, etc) whereas w is just the formatted text
                                this is important since Resource Size are in numbers, Level & Step are strings, and Dates are in strings
                             */

                            //console.log(spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['B' + j]);
                            tempObject[spreadsheet['SheetNames'][i]][spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['A' + j].w] =
                                (numberFields.indexOf(spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['A' + j].w) !== -1) ?
                                    spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['B' + j].v : spreadsheet['Sheets'][spreadsheet['SheetNames'][i]]['B' + j].w;
                        }
                        //increment j
                        j++;
                        //!ref is the last key of each sheet object. this tells the range of cells e.g. 'A1:B4'
                    } while (rows[j] !== '!ref');
                }

                //console.log(tempObject);
                //need to wrap assignment to $scope.$apply() to update the bindings in the html immediately
                $scope.$apply(function(){
                    $scope.dealForm = preProcess(tempObject, true);
                });
                //console.log($scope.dealForm);
            }

            if (rABS) {
                reader.readAsBinaryString(f);
            } else {
                reader.readAsArrayBuffer(f);
            }
        }

        $('#newDealFile')[0].addEventListener('change', processExcel, false);
    }
})();