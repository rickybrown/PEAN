angular.module('app', ['ui.router', 'ngMaterial', 'ngStorage']);

var app = angular.module('app');

app.run(function($rootScope, $localStorage, Auth, $mdMedia, $window){
  $window.Stripe.setPublishableKey(env.client_stripe_pk);

  $rootScope.providers = ['instagram', 'facebook', 'twitter']
  $rootScope.$on('$stateChangeStart', function(){
    // check for current user
    if($localStorage.currentUser){
      setUser();
    } else if($localStorage.token){
      Auth.current().then(function(user){
        $localStorage.currentUser = user;
        setUser();
      }).catch(function(err){
        $rootScope.currentUser = undefined;
      });
    } else {
      $rootScope.currentUser = undefined;
    };
  });
  function setUser(){
    $rootScope.currentUser = $localStorage.currentUser;
  }
  $rootScope.resetToken = function(resp){
    if(resp.token){
      $localStorage.token = resp.token;
      $rootScope.currentUser = resp;
      delete $localStorage.currentUser;
    }
  }
  $rootScope.$on('loading:start', function (){
    $rootScope.isLoading = true;
  });
  $rootScope.$on('loading:finish', function (){
    $rootScope.isLoading = false;
  });
  $rootScope.$watch(function() {return $mdMedia('xs');}, function(xs) {
    $rootScope.mobile = (xs ? true : false)
  });
  $rootScope.$watch(function() {return $mdMedia('sm');}, function(sm) {
    $rootScope.tablet = (sm ? true : false)
  });
});
