(function () {
    'use strict';
 
    angular
        .module('app', ['ui.router', 'ui.bootstrap', 'ngToast'])
        .config(config)
        .run(run);

    function config($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/');
 
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'login/login.html',
                controller: 'LoginController'
            })
            .state('main', {
                templateUrl: 'main/main.html',
                controller: 'MainController'
            })
            .state('home', {
                url: '/',
                parent: 'main',
                templateUrl: 'home/home.html',
                //controller: 'HomeController'
            })
            .state('clientList', {
                url: '/clients/list',
                parent: 'main',
                templateUrl: 'clients/list.html',
                controller: 'ClientListController'
            })
            .state('dealList', {
                url: '/deals/list',
                parent: 'main',
                templateUrl: 'deals/list.html',
                controller: 'DealListController'
            })
            .state('dealForm', {
                url: '/deals/dealForm/:ID',
                parent: 'main',
                templateUrl: 'deals/dealForm.html',
                controller: 'DealFormController'
            })
            .state('newClient', {
                url: '/clients/new',
                parent: 'main',
                templateUrl: 'clients/new.html',
                controller: 'NewClientController'
            })
            .state('fields', {
                url: '/fields',
                parent: 'main',
                templateUrl: 'fields/fields.html',
                controller: 'FieldsController'
            });

        $httpProvider.interceptors.push(function($q, $window, $location){
            return {
                'responseError': function(rejection){
                    var defer = $q.defer();

                    if(rejection.status == 401){
                        console.log('401 detected');
                        location.reload();
                    }

                    defer.reject(rejection);

                    return defer.promise;
                }
            };
        });
    }
 
    function run($rootScope, $state, UserService, $http) {
        $rootScope.user = {};

        $rootScope.fromState = {
            name: 'home',
            url: '/'
        };

        // add JWT token as default auth header
        $http.get('/app/token').then(function(res){
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + res.data;
        });

        //when the app is refreshed, get the current logged in user
        UserService.getCurrent().then(function(user) {
            $rootScope.user = user;
        }).catch(function(err) {
            console.log(err);
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            //not logged in
            if ($rootScope.user.email === undefined && toState.name !== 'login') {
                $state.transitionTo('login');
            //already logged in
            } else if ($rootScope.user.email !== undefined && toState.name === 'login') {
                //return to previous page
                $state.transitionTo($rootScope.fromState.name);
            //restrict access of 'users' to fields page
            } else if ($rootScope.user.role !== 'Admin' && toState.name === 'fields') {
                //go back to previous
                $state.transitionTo(fromState.name);
            //access is allowed
            } else {
                //save fromState (except login) to rootScope variable
                $rootScope.fromState = (fromState.name !== 'login') ? {
                    name: fromState.name,
                    url: fromState.url
                } : {
                    name: 'home',
                    url: '/'
                };
            }
        });
    }
 
    /* // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            //alert(token);
            if(token.indexOf('<html>') != -1){
                location.reload();
            }
            else{
                window.jwtToken = token;
 
                angular.bootstrap(document, ['app']);
            }
        });
    }); */
})();