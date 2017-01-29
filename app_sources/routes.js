'use strict';

app.config(['$routeProvider',
  function($routeProvider) {

    // home
    $routeProvider.when('/', {
      controller: 'BootCtrl',
      templateUrl: 'Boot/template.html',
    });

    // splashscreen
    $routeProvider.when('/intro', {
      controller: 'IntroCtrl',
      templateUrl: 'Intro/template.html',
    });

    // menu for navigation through wheels
    $routeProvider.when('/menus/:path*', {
      controller: 'MenuCtrl',
      templateUrl: 'Menu/template.html',
    });

    // debug index
    $routeProvider.when('/debug', {
      templateUrl: 'Debug/template.html',
    });

    // menus debug
    $routeProvider.when('/debug/menus', {
      controller: 'DebugMenusCtrl',
      templateUrl: 'Debug/Menus/template.html',
    });

    // gamepad debug
    $routeProvider.when('/debug/gamepads', {
      controller: 'DebugGamepadsCtrl',
      templateUrl: 'Debug/Gamepads/template.html',
    });

    // inputs debug
    $routeProvider.when('/debug/inputs', {
      controller: 'DebugInputsCtrl',
      templateUrl: 'Debug/Inputs/template.html',
    });

    // settings debug
    $routeProvider.when('/debug/settings', {
      controller: 'DebugSettingsCtrl',
      templateUrl: 'Debug/Settings/template.html',
    });

    // main option menu
    $routeProvider.when('/settings', {
      controller: 'SettingsCtrl',
      templateUrl: 'Settings/template.html',
    });

    // retro-achievements menu
    $routeProvider.when('/retroachievements', {
      controller: 'RetroAchievementsCtrl',
      templateUrl: 'RetroAchievements/template.html',
    });

    // error page
    $routeProvider.when('/error', {
      controller: 'ErrorCtrl',
      templateUrl: 'Error/template.html',
    });

    // default route
    $routeProvider.otherwise({
      redirectTo: '/error',
    });

  }
]);