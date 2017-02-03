'use strict';
app.controller('RetroAchievementsCtrl', ['$scope','retroachievements','settings', '_',
  function($scope, retroachievements,settings,_) { 
    
      var userRA =$scope.userRA = settings.$obj.userRA;
      var apiKeyRA = settings.$obj.apiKeyRA;
      $scope.baseUrl = "http://retroachievements.org/";
    
      retroachievements.GetUserSummary(userRA,apiKeyRA,5, function(userdata) {
         
         $scope.GetUserSummary = userdata.data;
         
         var gameList= "";
  
         angular.forEach(userdata.data.RecentlyPlayed, function(value, key) {
                gameList= value.GameID + "," + gameList ;
         });

         var gameListClean = gameList.substring(0, gameList.length-1);
         var gameStat =[];
         retroachievements.GetUserProgress(userRA,apiKeyRA,gameListClean, function(progressdata) {
           $scope.GetUserProgress =progressdata.data
           _.forEach(userdata.data.RecentlyPlayed, function(value, key) {

              _.forEach(progressdata.data, function(value2, key2) {
                if (value.GameID == key2){
                   gameStat.push(_.merge(value2, value));             
                }
              });
         });
         });
         $scope.gameStat=gameStat;
         console.log(userdata.data);
      });

  }
]);
