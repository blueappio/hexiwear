"use strict";

/* Angular module initialization */
var app;
(function(){
  app = angular.module('hexiwear', ['ngMaterial', 'ngMdIcons'])

  /* Color palette setup */
      .config(function($mdThemingProvider) {
          $mdThemingProvider.definePalette('blue-qb', {
              '50': 'b0bbc1',
              '100': '91afc1',
              '200': '7ba7c1',
              '300': '5b9bc1',
              '400': '3a8ec1',
              '500': '2988c1',
              '600': '0a3b7a',
              '700': '0a3b7a',
              '800': '0a3b7a',
              '900': '2193eb',
              'A100': '0a3b7a',
              'A200': '0a3b7a',
              'A400': '0a3b7a',
              'A700': '0a3b7a',
              'contrastDefaultColor': 'light', // whether, by default, text (contrast)
              // on this palette should be dark or light

              'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                  '200', '300', '400', 'A100'
              ],
              'contrastLightColors': undefined // could also specify this if default was 'dark'
          });

          $mdThemingProvider.definePalette('black-qb', {
              '50': 'dddddd',
              '100': 'a3a3a3',
              '200': '797979',
              '300': '525252',
              '400': '363636',
              '500': '121212',
              '600': '000000',
              '700': '000000',
              '800': '000000',
              '900': '000000',
              'A100': '848484',
              'A200': '848484',
              'A400': '848484',
              'A700': '848484',
              'contrastDefaultColor': 'light', // whether, by default, text (contrast)
              // on this palette should be dark or light

              'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                  '200', '300', '400', 'A100'
              ],
              'contrastLightColors': undefined // could also specify this if default was 'dark'
          });

          $mdThemingProvider.theme('default')
              .primaryPalette('blue-qb', {
                  'default': '600', // by default use shade 400 from the pink palette for primary intentions
                  'hue-1': '900', // use shade 100 for the <code>md-hue-1</code> class
                  'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                  'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
              })
              .accentPalette('black-qb', {
                  'default': '600', // by default use shade 400 from the pink palette for primary intentions
                  'hue-1': '900', // use shade 100 for the <code>md-hue-1</code> class
                  'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                  'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
              });
          $mdThemingProvider.theme('success-toast');
          $mdThemingProvider.theme('error-toast');
          $mdThemingProvider.alwaysWatchTheme(true);
      })
})();

app.run(['$document', '$window', function($document, $window) {
    var document = $document[0];
    document.addEventListener('click', (event) => {
        var hasFocus = document.hasFocus();
        if (!hasFocus) $window.focus();
    });
}]);

app.controller('mainController', function($scope, $mdDialog, $mdToast){
    $scope.hexiwear = window.hexiwear;

    /* Defining info popup screen */
    $scope.infoPopup = () => {
        $mdDialog.show({
            controller: 'infoController',
            templateUrl: 'app/pages/infoPopup.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            locals:{
                mode: $scope.hexiwear.deviceInfoData.modeData,
                manufacturer: $scope.hexiwear.deviceInfoData.manufacturerName,
                firmware: $scope.hexiwear.deviceInfoData.firmware,
                batteryLevel: $scope.hexiwear.deviceInfoData.batteryData,
                deviceStatus: $scope.hexiwear.paired
            }
        });
    };

    /* Closing popup function */
    $scope.cancel = () => {
        $mdDialog.cancel();
    };

    /* Success toast function */
    $scope.hexiwear.onSuccess = (message) => {
        $scope.toast = true;
        setTimeout(() => {
            $scope.toast = false;
        },3500);
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .parent(document.querySelectorAll('#toaster'))
                .position('top right')
                .hideDelay(2500)
                .theme("success-toast")
        );
    };

    /* Error toast function */
    $scope.hexiwear.onError = (message) => {
        $scope.toast = true;
        setTimeout(() => {
            $scope.toast = false;
        },3500);
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .parent(document.querySelectorAll('#toaster'))
                .position('top right')
                .hideDelay(2500)
                .theme("error-toast")
        );
    };

    /* Calling connection toast */
    // $scope.hexiwear.onSuccess('Connecting ....');

    /* UI update function */
    $scope.hexiwear.updateUI = () => {
        $scope.$apply();
    };

    /* Defining loading indicator dialog */
    function showLoadingIndicator($mdDialog, $event, text) {
        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false,
            escapeToClose: false,
            template: '<md-dialog style="width: 250px;" aria-label="loading">' +
            '<md-dialog-content>' +
            '<div layout="row" layout-align="center" style="padding: 25px; margin-left: 50px">' +
            '<md-progress-circular md-mode="indeterminate" md-diameter="40">' +
            '</md-progress-circular>' +
            '</div>' +
            '<div layout="row" layout-align="center" style="padding-bottom: 20px;">' +
            '<label>' + text + '</label>' +
            '</div>' +
            '</md-dialog-content>' +
            '</md-dialog>',
            locals: {}
            });
    }

    /* Defining disconnect dialog */
    function showDisconnectIndicator($mdDialog, $event, text) {
        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false,
            escapeToClose: false,
            template: '<md-dialog style="width: 300px;" aria-label="loading">' +
            '<md-dialog-content>' +
            '<div layout="row" layout-align="center" style="padding: 25px;">' +

            '</div>' +
            '<div layout="row" layout-align="center" style="padding-bottom: 40px;">' +
            '<label>' + text + '</label>' +
            '</div>' +
            '</md-dialog-content>' +
            '</md-dialog>',
            locals: {
                items: ''
            }
        });
    }

    /* Defining function for connecting */
    $scope.hexiwear.loading = () => {
        showLoadingIndicator($mdDialog, '', 'Connecting ...');
    };

    /* Defining function for closing the dialog */
    function dismissLoadingIndicator($mdDialog) {
        $mdDialog.cancel();
    }

    /* Defining function for closing from the hexiwear class */
    $scope.hexiwear.dismiss = () => {
        dismissLoadingIndicator($mdDialog);
    };

    /* Accordion click listeners for sliding divs */
    document.querySelector('.accordion1').addEventListener('click',function(){
        document.getElementsByClassName('card1-clip')[0].classList.toggle("expanded");
        document.getElementsByClassName('card1')[0].classList.toggle('expanded');
        document.getElementsByClassName('card1-collapsed-content')[0].classList.toggle('slide');
        document.getElementsByClassName('card1-expanded-content')[0].classList.toggle('slide');
        document.getElementsByClassName('accordion1')[0].classList.toggle('active');
        document.getElementsByClassName('accordion1')[0].nextElementSibling.classList.toggle("show");
    });
    document.querySelector('.accordion2').addEventListener('click',function(){
        document.getElementsByClassName('card2-clip')[0].classList.toggle("expanded");
        document.getElementsByClassName('card2')[0].classList.toggle('expanded');
        document.getElementsByClassName('card2-collapsed-content')[0].classList.toggle('slide');
        document.getElementsByClassName('card2-expanded-content')[0].classList.toggle('slide');
        document.getElementsByClassName('accordion2')[0].classList.toggle('active');
        document.getElementsByClassName('accordion2')[0].nextElementSibling.classList.toggle("show");
    });
    document.querySelector('.accordion3').addEventListener('click',function(){
        document.getElementsByClassName('card3-clip')[0].classList.toggle("expanded");
        document.getElementsByClassName('card3')[0].classList.toggle('expanded');
        document.getElementsByClassName('card3-collapsed-content')[0].classList.toggle('slide');
        document.getElementsByClassName('card3-expanded-content')[0].classList.toggle('slide');
        document.getElementsByClassName('accordion3')[0].classList.toggle('active');
        document.getElementsByClassName('accordion3')[0].nextElementSibling.classList.toggle("show");
    });

    /* Defining function for disconnect indicator */
    $scope.hexiwear.disconnectIndicator = () => {
        showDisconnectIndicator($mdDialog, '', 'Device disconnected');
    };

    /* On click event for setting date/time */
    $scope.sendNotifications = () => {
        $scope.hexiwear.setDateTime();
    };

    /* Calling refresh data function */
    setInterval(() => {
        if($scope.hexiwear.connected != undefined){
            $scope.hexiwear.refreshValues();
        }
    },1000);

    /* Calling loading indicator */
    $scope.hexiwear.loading();

    /* Calling connect function */
    $scope.hexiwear.connect();

});

/* Defining controller for info dialog screen */
app.controller('infoController', function($scope, $mdDialog, mode, manufacturer, firmware, batteryLevel, deviceStatus){
    $scope.currentMode = mode;
    $scope.manufacturer = manufacturer;
    $scope.firmware = firmware;
    $scope.batteryLevel = batteryLevel;
    
    $scope.cancel = () => {
        $mdDialog.cancel();
    };

    if($scope.batteryLevel == undefined){
        $scope.batteryLevel = 'Unknown';
    }

    switch (deviceStatus){
        case false:
            $scope.deviceStatus = 'Not paired';
            break;
        case true:
            $scope.deviceStatus = 'Paired';
            break;
        default:
            $scope.deviceStatus = 'Unknown';
            break;
    }

    switch (mode){
        case 0:
            $scope.currentMode = 'None';
            break;
        case 2:
            $scope.currentMode = 'Sensor Tag';
            break;
        case 5:
            $scope.currentMode = 'Heart Rate';
            break;
        case 6:
            $scope.currentMode = 'Pedometer';
            break;
        default:
            $scope.currentMode = 'Unknown';
            break;
    }
});
