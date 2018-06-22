(function(){
    'use strict';

    angular
        .module('app')
        .controller('UserFormController', Controller);
    
    function Controller($scope, $rootScope, $location, $state, ModulesService, UserService, ngToast, $stateParams) {
        $scope.userForm = {};
        $scope.module = {};

        //Enable/Disable Email input based on url location
        var userFormLocation = $location.$$path;
        $scope.emailInputEnabled = true;
        if(userFormLocation != '/users/userForm/'){
            $scope.emailInputEnabled = false;
        }

        function getUserFields() {
            ModulesService.getModuleByName('users').then(function(aModule) {
                $scope.module = aModule;
            }).catch(function(err) {

            });
        }

        getUserFields();
        console.log($stateParams._id);
        if($stateParams._id !== '') {
            ModulesService.getModuleDocById('users', $stateParams._id).then(function(moduleDoc) {
                console.log(moduleDoc);
                $scope.userForm = moduleDoc;
            }).catch(function(err) {
                console.log(err);
                if(err.notFound) {
                    ngToast.danger('User not found');
                }
                $scope.userForm = {};
            });
        }

        $scope.submit = function () {
            var toSave = {
                moduleName: $scope.module.name,
                moduleDoc: $scope.userForm
            };

            if($scope.userForm._id === undefined) {
                /*ModulesService.addModuleDoc(toSave).then(function() {
                    ngToast.success('User added');
                    $state.transitionTo('UserList');
                }).catch(function(err){
                    ngToast.danger(err);
                });*/
                UserService.Insert($scope.userForm)
                    .then(function () {
                    ngToast.success('User added');
                    $state.transitionTo('UserList');

                }).catch(function (error) {
                    if(error.exists){
                        ngToast.danger('Email is already taken');
                    }
                    else if(error.invalid){
                        ngToast.danger('Email is invalid');
                    }
                    else{
                        ngToast.danger(error);
                    }
                }); 
            } else {
                /*ModulesService.updateModuleDoc(toSave).then(function() {
                    ngToast.success('User updated');
                    $state.transitionTo('UserList');
                }).catch(function(err){
                    ngToast.danger(err);
                });*/
                UserService.Update($scope.userForm)
                    .then(function () {
                    ngToast.success('User added');
                    $state.transitionTo('UserList');   
                }).catch(function (error) {
                    ngToast.danger(error);
                });
            }
        }
    }

})();