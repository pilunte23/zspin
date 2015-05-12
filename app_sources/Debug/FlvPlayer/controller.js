'use strict';

app.controller('DebugFlvPlayerCtrl', ['$scope', 'settings',
  function($scope, settings) {

    $scope.flv = settings.hsPath('Media', 'Frontend', 'Video', 'Intro.flv');
    $scope.volume = 50;
    $scope.width = 320;
    $scope.height = 240;
    $scope.player = {};

    $scope.setPosition = 30;
    $scope.setVolume = 0;

    // /Users/godric/Library/Application\ Support/zspin/Media/Frontend/Video/Intro.flv
  }
]);
