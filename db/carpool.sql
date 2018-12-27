CREATE TABLE cp_rides (
    ride_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    device CHAR(33) NOT NULL,
    pickup_address VARCHAR NOT NULL,
    pickup_lat FLOAT NOT NULL,
    pickup_lng FLOAT NOT NULL,
    dropoff_address VARCHAR NOT NULL,
    dropoff_lat FLOAT NOT NULL,
    dropoff_lng FLOAT NOT NULL,
    departure DATETIME NOT NULL,
    seats TINYINT NOT NULL,
    price_per_seat INTEGER NOT NULL,
    checkin_code VARCHAR NOT NULL
);

CREATE INDEX cp_rides_departure ON cp_rides(departure);
CREATE INDEX cp_rides_device ON cp_rides(device);
CREATE INDEX cp_rides_checkin_code ON cp_rides(checkin_code);

CREATE TABLE cp_reservations (
    ride_id INTEGER NOT NULL,
    device CHAR(33) NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'reserved',
    reservation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ride_id, device),
    FOREIGN KEY (ride_id) REFERENCES cp_rides(ride_id)
);

CREATE INDEX cp_reservations_device ON cp_reservations(device);