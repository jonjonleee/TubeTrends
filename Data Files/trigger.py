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
        
        # sql1 = """
        #     DROP TRIGGER userTrigger;
        #     CREATE TRIGGER userTriggerInsert
        #         BEFORE INSERT ON User
        #         FOR EACH ROW
        #         BEGIN
        #             SET @age = (SELECT DATEDIFF (CURDATE(), new.Birthday) / 365);
        #             SET @currDate = (SELECT CURDATE());
        #             IF ( @age < 0) THEN
        #                 SET new.Birthday = @currDate;
        #                 SET new.ageGroup = "Kid";
        #             ELSEIF (@age < 13 ) THEN
        #                 SET new.ageGroup = "Kid";
        #             ELSEIF (@age < 18 ) THEN
        #                 SET new.ageGroup = "Teen";
        #             ELSE
        #                 SET new.ageGroup = "Adult";
        #             END IF;
        #         END;
        #         """
        sql1 = """
            CREATE TRIGGER userTriggerUpdate
                BEFORE Update ON User
                FOR EACH ROW
                BEGIN
                    SET @age = (SELECT DATEDIFF (CURDATE(), new.Birthday) / 365);
                    SET @currDate = (SELECT CURDATE());
                    IF ( @age < 0) THEN
                        SET new.Birthday = @currDate;
                        SET new.ageGroup = "Kid";
                    ELSEIF (@age < 13 ) THEN
                        SET new.ageGroup = "Kid";
                    ELSEIF (@age < 18 ) THEN
                        SET new.ageGroup = "Teen";
                    ELSE
                        SET new.ageGroup = "Adult";
                    END IF;
                END;
                """
        cursor.execute(sql1)
        # results = cursor.fetchall()

        # for row in results:
        #     print(row)

        conn.commit()
        cursor.close()
    conn.close()
except Error as e:
    print("Error while connecting to MySQL", e)