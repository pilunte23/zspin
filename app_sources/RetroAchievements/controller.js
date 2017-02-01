'use strict';

      var userRA =$scope.userRA = settings.$obj.userRA;
      var apiKeyRA = settings.$obj.apiKeyRA;
      $scope.baseUrl = "http://retroachievements.org/";

      retroachievements.GetUserSummary(userRA,apiKeyRA, function(response) {
          $scope.GetUserSummary = response.data;
      });
     
      
      retroachievements.GetUserSummary(userRA,apiKeyRA,5, function(userdata) {
         
         $scope.GetUserSummary = userdata.data;
         
         var gameList= "";
  
         angular.forEach(userdata.data.RecentlyPlayed, function(value, key) {
                gameList= value.GameID + "," + gameList ;
         });

         var gameListClean = gameList.substring(0, gameList.length-1);
         
         retroachievements.GetUserProgress(userRA,apiKeyRA,gameListClean, function(progressdata) {
           $scope.GetUserProgress =progressdata.data
         });
    
      });


  }
]);
