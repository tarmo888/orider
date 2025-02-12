(function () {

    var app = angular.module("carpool", ["ngRoute", "ngCookies", "monospaced.qrcode", "ngDetectmobilebrowser"]);

    function fetchConfig() {
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");

        return $http.get("/api/config").then(function (response) {
            app.constant("CONFIG", response.data);
            return response.data;
        }, function (errorResponse) {
            console.error("Failed to fetch bootstrapping data: " + errorResponse);
            throw Error("Failed to bootstrap application");
        });
    }

    function bootstrapApplication(config) {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["carpool"]);
        });
        return config;
    }

    app.config(function ($routeProvider, $compileProvider, $httpProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension|byteball|byteball-tn):|data:image\/)/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|byteball|byteball-tn):/);
        $httpProvider.interceptors.push("HttpInterceptor");

        $routeProvider
            .when("/login", {
                nav: "Login",
                templateUrl: "view/login.html",
                controller: "LoginController",
                resolve: {
                    login: function(AuthService) {
                        return AuthService.resolve();
                    }
                }
            })
            .when("/my/ride/:id", {
                nav: "MyRide",
                templateUrl: "view/myride.html",
                controller: "MyRideController",
                resolve: {
                    account: function(AccountService) {
                        return AccountService.resolve();
                    }
                }
            })
            .when("/my/reservations/:id", {
                nav: "MyReservation",
                templateUrl: "view/myreservation.html",
                controller: "MyReservationController",
                resolve: {
                    account: function(AccountService) {
                        return AccountService.resolve();
                    }
                }
            })
            .when("/my/account", {
                nav: "MyAccount",
                templateUrl: "view/myaccount.html",
                controller: "MyAccountController",
                resolve: {
                    account: function(AccountService) {
                        return AccountService.resolve();
                    }
                }
            })
            .otherwise({
                templateUrl: "view/rides.html",
                controller: "RidesController",
                resolve: {
                    account: function(AccountService) {
                        return AccountService.resolve().catch(function (reason) {
                            console.error(reason);
                        });
                    }
                }
            });
    });

    fetchConfig().then(bootstrapApplication);

})();
