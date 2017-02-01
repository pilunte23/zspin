'use strict';

app.factory('retroachievements', ['$http',
  function ($http) {
      console.log('retroachievements - init');
      var retroachievements = {};
      var baseURL = 'http://retroachievements.org/API/';

      
      // General Information
      retroachievements.GetTopTenUsers = function(user,apiKey,callback){
         $http.get(baseURL + 'API_GetTopTenUsers.php?z='+user+'&y='+apiKey).then(function(response){callback(response)});     
      }; 

      retroachievements.GetConsoleIDs= function(user,apiKey,callback){
         $http.get(baseURL + 'API_GetConsoleIDs.php?z='+user+'&y='+apiKey).then(function(response){callback(response)});     
      };   

      //Game Information
      retroachievements.GetGameInfo = function(user,apiKey,gameID,callback){
         $http.get(baseURL + 'API_GetGame.php?z='+user+'&y='+apiKey+'&i='+gameID).then(function(response){callback(response)});     
      }; 

      retroachievements.GetGameInfoExtended= function(user,apiKey,gameID,callback){
         $http.get(baseURL + 'API_GetGameExtended.php?z='+user+'&y='+apiKey+'&i='+gameID).then(function(response){callback(response)});     
      };    
    
      retroachievements.GetGameInfoAndUserProgress = function(user,apiKey,gameID,callback){
         $http.get(baseURL + 'API_GetGameInfoAndUserProgress.php?z='+user+'&y='+apiKey+'&u='+user+'&g='+gameID).then(function(response){callback(response)});     
      };
      
      //broken API
      retroachievements.GetGameList= function(user,apiKey,consoleID,callback){
         $http.get(baseURL + 'API_GetGameList.php?z='+user+'&y='+apiKey+'&i='+consoleID).then(function(response){callback(response)});     
      }; 

      //User Information
      retroachievements.GetUserSummary = function(user,apiKey,numRecentGames,callback){
         $http.get(baseURL + 'API_GetUserSummary.php?z='+user+'&y='+apiKey+'&u='+user+'&g='+numRecentGames).then(function(response){callback(response)});     
      };
      retroachievements.GetUserRankAndScore = function(user,apiKey,callback){
         $http.get(baseURL + 'API_GetUserRankAndScore.php?z='+user+'&y='+apiKey+'&u='+user).then(function(response){callback(response)});     
      };

      retroachievements.GetUserRecentlyPlayedGames= function(user,apiKey,count,offset,callback){
         $http.get(baseURL + 'API_GetUserRecentlyPlayedGames.php?z='+user+'&y='+apiKey+'&c='+count+'&o='+offset+'&u='+user).then(function(response){callback(response)});     
      };

      retroachievements.GetFeedFor= function(user,apiKey,count,offset,callback){
         $http.get(baseURL + 'API_GetFeedFor.php?z='+user+'&y='+apiKey+'&c='+count+'&o='+offset+'&u='+user).then(function(response){callback(response)});     
      };

     retroachievements.GetUserProgress = function(user,apiKey,gameList,callback){
         $http.get(baseURL + 'API_GetUserProgress.php?z='+user+'&y='+apiKey+'&u='+user+"&i="+gameList).then(function(response){callback(response)});     
      };

      console.log('retroachievements - ready');
      return retroachievements;
    }
]);