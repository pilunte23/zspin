'use strict';

app.factory('retroachievements', ['$http',
  function ($http) {
      console.log('retroachievements - init');
      var retroachievements = {};
      var baseURL = 'http://retroachievements.org/API/';

      retroachievements.GetUserSummary = function(userRA,apiKeyRA,callback){
         $http.get(baseURL + 'API_GetUserSummary.php?z='+userRA+'&y='+apiKeyRA+'&u='+userRA+'&mode=json').then(function(response){callback(response)});     
      };

      retroachievements.GetTopTenUsers = function(userRA,apiKeyRA,callback){
         $http.get(baseURL + 'API_GetTopTenUsers.php?z='+userRA+'&y='+apiKeyRA+'&mode=json').then(function(response){callback(response)});     
      };     

      console.log('retroachievements - ready');
      return retroachievements;
    }
]);