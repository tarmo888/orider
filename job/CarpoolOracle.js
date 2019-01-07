"use strict";

const composer = require('byteballcore/composer.js');
const network = require('byteballcore/network.js');

module.exports = function (carpoolOracleAddress, headlessWallet, ridesRepository) {

    function postRideStatus(rideId, rideStatus) {
        const datafeed = {
            RIDE_STATUS: `RIDE-${rideId}-${rideStatus}`
        };

        console.error("[ORACLE] posting " + JSON.stringify(datafeed));

        const errorHandler = function(err) {
            console.error(`[ORACLE] failed to post ${JSON.stringify(datafeed)}: ${err}`);
        };

        composer.composeDataFeedJoint(carpoolOracleAddress, datafeed, headlessWallet.signer, composer.getSavingCallbacks({
            ifNotEnoughFunds: errorHandler,
            ifError: errorHandler,
            ifOk: function (joint) {
                network.broadcastJoint(joint);
                ridesRepository.payout(rideId, rideStatus, joint.unit.unit, (err) => {
                    if (err) return console.error(`[ORACLE] failed to save ${rideStatus} status for ride ${rideId}`);
                    console.error(`[ORACLE] stored status for ride ${rideId} in unit ${joint.unit.unit}`);
                });
            }
        }));
    }

    function processCompletedRide(ride) {
        const totalPeople = ride.passengerCount + 1; // include driver
        const totalVoters = ride.scoredPassengerCount + 1; // include driver
        const totalScore = ride.passengerScore + ride.driverScore;

        const participationRate = totalVoters / totalPeople;

        if (participationRate < 0.67) {
            return; // skip and wait until more than two third of the people completed the ride
        }

        const averageScore = totalScore / totalVoters;
        const rideStatus = averageScore > 0.95 ? "COMPLETED" : "INCOMPLETE";

        postRideStatus(ride.rideId, rideStatus);
    }

    function processCompletedRides() {
        ridesRepository.selectAllPayable((err, rides) => {
            rides.forEach(processCompletedRide);
        });
        setTimeout(processCompletedRides, 5000);
    }

    return {
        start() {
            processCompletedRides();
        }
    };
};