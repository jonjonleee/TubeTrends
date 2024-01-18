import json
import mysql.connector as msql
from mysql.connector import Error

# Source: https://www.projectpro.io/recipes/connect-mysql-python-and-import-csv-file-into-mysql-and-create-table
# Connect to Database from local device
try:
    conn = msql.connect(host='34.171.181.180', database="TubeTrendz", user='root',  
                        password='password')
    if conn.is_connected():
        cursor = conn.cursor()
        cursor.execute("select database();")
        record = cursor.fetchone()
        print("You're connected to database: ", record)
        # ADD url to video
        # Modify
        sql1 = """
                CREATE PROCEDURE favoriteRanks (
                      userIDIn INT , 
                      listofVideos VARCHAR(1000))
                BEGIN
                    DECLARE done INT DEFAULT 0; 
                    DECLARE vidID VARCHAR(11);
                    DECLARE perc INT;
                    DECLARE videoPercentile VARCHAR(48); 
                    
                    DECLARE cur1 CURSOR FOR
                            SELECT videoMax.videoID, ROUND (PERCENT_RANK()
                                OVER (
                                    ORDER BY videoMax.viewCount
                                ),2) AS percentile
                            FROM 
                            (SELECT v.videoID, MAX(t.viewCount) AS viewCount
                                FROM Video v JOIN TrendingStats t ON v.videoID = t.videoID
                                GROUP BY v.videoID) AS videoMax
                            WHERE FIND_IN_SET(videoMax.videoID, listofVideos) > 0;

                    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;        

                    OPEN cur1;
                    REPEAT 
                        FETCH cur1 INTO vidID, perc;
        
                        IF (perc >= 0.75 ) THEN 
                        SET videoPercentile = "Highest Quartile";
                        ELSEIF (perc >= 0.50 ) THEN 
                        SET videoPercentile = "Second Quartile";
                        ELSEIF (perc >= 0.25 ) THEN 
                        SET videoPercentile = "Third Quartile";
                        ELSE 
                        SET videoPercentile = "Bottom Quartile";
                        END IF;
                        
                        INSERT IGNORE INTO Favorite(userID, videoID, ranking, percentile)
                        VALUES (userIDIn, vidID, 1, videoPercentile);
                    UNTIL done
                    END REPEAT;
                    CLOSE cur1;

                    SELECT DISTINCT Video.title as title, Channel.channelName as channel, Category.categoryName as category, Favorite.percentile as percentile
                    FROM Favorite JOIN Video ON Favorite.videoID = Video.videoID
                    JOIN Channel ON Channel.channelID = Video.channelID 
                    JOIN Category ON Category.categoryID = Video.categoryID
                    WHERE Favorite.userID = userIDIn;
                END;
                """
            # // **** WRITE FIND THE NUMBER OF OTHER USERS THAT LIKE THIS VIDEO TOO
            #             SELECT COUNT(*) INTO numUsers
            #             FROM User JOIN Favorite 
            #             WHERE User.ageGroup = (SELECT ageGroup FROM USER WHERE User.userID = userID)
            #             GROUP BY vidID
        # Stored Procedure Number 2
        # Filter videos by age for table

        # IN age VARCHAR(12)
        #   CREATE VIEW [kidAppropriate] AS SELECT videoID FROM Video WHERE  
        #                 tag LIKE "%eductation%" OR
        #                 tag LIKE "%learning%" OR
        #                 tag LIKE "%kids%" OR 
        #                 tag LIKE "%child%" OR 
        #                 tag LIKE "%craft%" OR
        #                 tag LIKE "%story%";
        # sql1 = """
        #                     SELECT COUNT(DISTINCT title) FROM Video WHERE  
        #                     tag LIKE "%eductation%" OR
        #                     tag LIKE "%learning%" OR
        #                     tag LIKE "%kids%" OR 
        #                     tag LIKE "%child%" OR 
        #                     tag LIKE "%craft%" OR
        #                     tag LIKE "%story%" OR
        #                     tag LIKE "%diy%"
        #                     """
        cursor.execute(sql1)
        results = cursor.fetchall()

        for row in results:
            print(row)

        conn.commit()
        cursor.close()
    conn.close()
except Error as e:
    print("Error while connecting to MySQL", e)