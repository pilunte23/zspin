'use strict';

app.controller('RetroAchievementsCtrl', ['$scope','retroachievements','settings',
  function($scope, retroachievements,settings) {

      var userRA =$scope.userRA = settings.$obj.userRA;
      var apiKeyRA = settings.$obj.apiKeyRA;
      $scope.baseUrl = "http://retroachievements.org/";

      retroachievements.GetUserSummary(userRA,apiKeyRA, function(response) {
          $scope.GetUserSummary = response.data;
      });
     
      


  }
]);
