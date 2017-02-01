angular.module('lodash', [])  
.factory('_', ['$window', function($window) {
    console.log('lodash - init');
    return $window._; // assumes underscore has already been loaded on the page
    console.log('lodash - ready');
}]);