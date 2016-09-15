app.controller('CardsCtrl', function($q, $scope, $rootScope, $mdDialog, $mdBottomSheet, $window, Resource){

  // launch dialog
  $scope.change = function() {
    var options = {
      scope: $scope.$new(),
      clickOutsideToClose:true
    }
    if($rootScope.tablet || $rootScope.mobile){
      options.templateUrl = 'account/cards/sheet.html',
      $mdBottomSheet.show(options)
      .then(function(resp){
        $rootScope.resetToken(resp);
      }).catch(function(err){
        console.log(err)
      });
    } else {
      options.templateUrl = 'account/cards/dialog.html',
      $mdDialog.show(options)
      .then(function(resp){
        $rootScope.resetToken(resp);
      }).catch(function(err){
        console.log(err)
      })
    }
  }
  // cancel/close open dialog
  $scope.cancel = function() {
    $mdDialog.cancel('change canceled');
  };

  // add/change/remove card
  $scope.update = function(cc){
    // add a new card
    if(!$rootScope.currentUser.cardId){
      Stripe.card.createToken(cc, function(status, resp) {
        if(resp.error) {
          // show error
        } else {
          var card = {
            type: 'card',
            token: resp.id,
            updateIp: resp.client_ip,
            card: resp.card.brand,
            last4: resp.card.last4,
            zip: resp.card.address_zip,
            exp: pad(resp.card.exp_month)+'/'+resp.card.exp_year
          }
          // check if user already has a customer id or not
          var param = ($rootScope.currentUser.customerId?'card':'customer')
          // save card
          Resource.save('cards', param, card)
          .then(function(resp){
            if(resp.status==200){
              $mdDialog.hide(resp.data);
            } else {$scope.error = resp.data;}
          });
        }
      });
      return false;
    // update the existing card
    } else {
      Resource.save('cards', 'card', cc)
      .then(function(resp){
        if(resp.status==200){
          $mdDialog.hide(resp.data);
        } else {$scope.error = resp.data;}
      });
    }
  }

  // delete card info from user record
  $scope.remove = function(){
    Resource.delete('cards', 'card')
    .then(function(resp){
      $rootScope.resetToken(resp);
    }).catch(function(err){
      $scope.error = err;
    })
  }

  // single zero padding for months
  function pad(n) {
    return (n < 10) ? ("0" + n) : n;
  }
})
