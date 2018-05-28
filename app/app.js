(function () {
    'use strict';
 
    angular
        .module('app', ['ui.router'])
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
            });

        $httpProvider.interceptors.push(function($q, $window, $location){
            return {
                'responseError': function(rejection){
                    var defer = $q.defer();

                    if(rejection.status == 401){
                        location.reload();
                    }

                    defer.reject(rejection);

                    return defer.promise;
                }
            };
        });
    }
 
    function run($rootScope, $state, UserService) {
        $rootScope.user = {};

        $rootScope.fromState = {
            name: 'home',
            url: '/'
        };

        //when the app is refreshed, get the current logged in user
        UserService.getCurrent().then(function(user) {
            $rootScope.user = user;
        }).catch(function(err) {
            console.log(err);
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            console.log('@stateChange: ', $rootScope.user);
            //not logged in
            if ($rootScope.user.email === undefined && toState.name !== 'login') {
                $state.transitionTo('login');
            //already logged in
            } else if ($rootScope.user.email !== undefined && toState.name === 'login') {
                //return to previous page
                $state.transitionTo($rootScope.fromState.name);
            } else {
                //save fromState to rootScope variable
                $rootScope.fromState = {
                    name: fromState.name,
                    url: fromState.url
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