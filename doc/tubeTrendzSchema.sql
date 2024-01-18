USE `TubeTrendz`;

DROP TABLE IF EXISTS `Category`;
CREATE TABLE Category (
	'categoryID' INT NOT NULL,
	'categoryName' VARCHAR(255),
    PRIMARY KEY('categoryID')
);

DROP TABLE IF EXISTS `Channel`;
CREATE TABLE 'Channel' (
	'channelID' VARCHAR(24) NOT NULL,
	'channelName' VARCHAR(255),
    PRIMARY KEY(channelID)
);

DROP TABLE IF EXISTS 'User';
CREATE TABLE 'User' (
	`userID` INT NOT NULL,
	`FirstName` VARCHAR(255),
	`LastName` VARCHAR(255),
	`Email` VARCHAR(255),
	`Password` VARCHAR(255) NOT NULL,
	`Birthday` DATE,
	'ageGroup' VARCHAR(12),
	PRIMARY KEY(userID)
);


DROP TABLE IF EXISTS `Video`;
CREATE TABLE 'Video' (
	`videoID` VARCHAR(11) NOT NULL,
	`channelID` VARCHAR(24) NOT NULL,
	`categoryID` INT NOT NULL,
	`title` VARCHAR(500),
	`publishedDate` DATE,
	`URL` VARCHAR(1000),
	`country` VARCHAR(255),
	`tag` VARCHAR(1000),
	`Description` VARCHAR(1000),
	PRIMARY KEY (`videoID`),
	FOREIGN KEY(`channelID`) REFERENCES 'Channel' (`channelID`) ON DELETE SET NULL,
	FOREIGN KEY(`categoryID`) REFERENCES 'Category' (`categoryID`) ON DELETE SET NULL
);

DROP TABLE IF EXISTS `TrendingStats`;
CREATE TABLE 'TrendingStats' (
    `trendDate` DATE,
    `videoID` VARCHAR(11),
    `likeCount` INT,
    `dislikeCount` INT,
    `viewCount` INT,
	`commentCount` INT,
    PRIMARY KEY (`trendDate`, `videoID`),
    FOREIGN KEY (`videoID`) REFERENCES 'Video' (`videoID`)  ON DELETE CASCADE
);

DROP TABLE IF EXISTS `Favorite`;
CREATE TABLE 'Favorite' (
	`userID` INT NOT NULL,
	`videoID`  VARCHAR(11) NOT NULL,
	`ranking` INT,
	PRIMARY KEY(`userID`, `videoID`),
	FOREIGN KEY (`userID`) REFERENCES 'User' (`userID`) ON DELETE CASCADE,
    FOREIGN KEY (`videoID`) REFERENCES 'Video' (`videoID`) ON DELETE CASCADE
);