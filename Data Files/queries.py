import pandas as pd
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

        sql1 = "SELECT Channel.channelName as channel, SUM(TrendingStats.viewCount) as views FROM Video LEFT JOIN TrendingStats ON Video.videoID = TrendingStats.videoID LEFT JOIN Channel on Channel.channelID = Video.channelID \
                GROUP BY Video.ChannelID ORDER BY views DESC LIMIT 15"
        
        sql2 = "SELECT c.categoryName, COUNT(*) AS NumVideos \
                FROM Video v NATURAL JOIN Category c \
                WHERE v.videoID  IN (SELECT videoID \
                FROM TrendingStats \
                WHERE viewCount > 1000000 and likeCount > 100000 ) \
                GROUP BY c.categoryName  \
                ORDER BY NumVideos ASC"

        cursor.execute(sql1)

        results = cursor.fetchall()

        for row in results:
            print(row)

        print("\n")
        cursor.execute(sql2)

        results = cursor.fetchall()

        for row in results:
            print(row)

        conn.commit()
        cursor.close()
    conn.close()
except Error as e:
    print("Error while connecting to MySQL", e)