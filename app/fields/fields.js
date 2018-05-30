(function(){
    'use strict';

    angular
        .module('app')
        .controller('FieldsController', Controller);

    
    function Controller($scope, $rootScope, $state, $filter, ModulesService) {
        $scope.message = '';
        $scope.module = {
            name: 'deals',
            fields: []
        };
        $scope.fieldForm = {
            category: '',
            name: '',
            type: 'text',
            unique: false,
            required: false
        };

        $scope.resetFieldForm = function () {
            $scope.fieldForm = {
                name: '',
                type: 'text',
                unique: false,
                required: false
            };
        }

        $scope.getModuleByName = function () {
            ModulesService.getModuleByName($scope.module.name).then(function (aModule) {
                $scope.module = aModule;
            }).catch(function (err) {
                $scope.message = 'Not found';
            });
        }

        $scope.submitField = function () {
            var forSave = {
                moduleName: $scope.module.name,
                field: $scope.fieldForm
            }
            console.log($scope.fieldForm);
            if ($scope.fieldForm.id === undefined) {
                ModulesService.addModuleField(forSave).then(function () {
                    $scope.message = 'Field added';
                    $scope.resetFieldForm();
                    $scope.getModuleByName();
                }).catch(function (err) {
                    console.log(err);
                    $scope.message = 'Cannot add the field';
                });
            } else {
                ModulesService.updateModuleField(forSave).then(function () {
                    $scope.message = 'Field updated';
                    $scope.resetFieldForm();
                    $scope.getModuleByName();
                }).catch(function (err) {
                    console.log(err);
                    $scope.message = 'Cannot update the field';
                });
            }
        }

        $scope.editField = function (aField) {
            angular.copy(aField, $scope.fieldForm);
        }

        $scope.deleteField = function (aField) {
            ModulesService.deleteModuleField($scope.module.name, aField.id).then(function () {
                $scope.message = 'Field deleted';
                $scope.resetFieldForm();
                $scope.getModuleByName();
            }).catch(function (err) {
                $scope.message = 'Cannot delete the field';
            });
        }

        $scope.getModuleByName();
    }
})();