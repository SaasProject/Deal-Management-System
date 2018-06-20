(function(){
    'use strict';

    angular
        .module('app')
        .controller('BUFormController', Controller);
    
    function Controller($scope, $state, ModulesService, ngToast, $stateParams) {
        $scope.businessUnitForm = {};
        $scope.module = {};

        function getBUFields() {
            ModulesService.getModuleByName('businessunits').then(function(aModule) {
                $scope.module = aModule;
            }).catch(function(err) {

            });
        }

        getBUFields();

        if($stateParams._id !== '') {
            ModulesService.getModuleDocById('businessunits', $stateParams._id).then(function(moduleDoc) {
                console.log(moduleDoc);
                $scope.businessUnitForm = moduleDoc;
            }).catch(function(err) {
                console.log(err);
                if(err.notFound) {
                    ngToast.danger('Business Unit not found');
                }
                $scope.businessUnitForm = {};
            });
        }

        $scope.submit = function () {
            var toSave = {
                moduleName: $scope.module.name,
                moduleDoc: $scope.businessUnitForm
            };

            if($scope.businessUnitForm._id === undefined) {
                ModulesService.addModuleDoc(toSave).then(function() {
                    ngToast.success('Business Unit added');
                    $state.transitionTo('BUList');
                }).catch(function(err){
                    ngToast.danger(err);
                });
            } else {
                ModulesService.updateModuleDoc(toSave).then(function() {
                    ngToast.success('Business Unit updated');
                    $state.transitionTo('BUList');
                }).catch(function(err){
                    ngToast.danger(err);
                });
            }
        }
    }

})();