import pandas as pd
import json
import mysql.connector as msql
from mysql.connector import Error

# Source: https://www.projectpro.io/recipes/connect-mysql-python-and-import-csv-file-into-mysql-and-create-table
# Connect to Database from local device
try:
    conn = msql.connect(host='', database="", user='',  
                        password='')
    if conn.is_connected():
        cursor = conn.cursor()
        cursor.execute("select database();")
        record = cursor.fetchone()
        print("You're connected to database: ", record)
        sql1 = "SELECT * FROM Category;"
        cursor.execute(sql1)
        results = cursor.fetchall()
        for row in results:
            print(row)
        # df = pd.read_csv("October_Video.csv") # Select the csv to parse
        # for index, row in df.iterrows():
        #     videoid = row["video_id"]
        #     if (videoid == "#NAME?"):
        #         continue                      # undefined videoid
        #     title = str(row["title"]).replace("'", "''")
        #     try:
        #         date_idx  = str(row["publishedAt"]).index("T")
        #         date = row["publishedAt"][:date_idx]
        #     except ValueError :
        #         continue    # poor formating of date field in csv, don't add
        #     channel = row["channelId"]
        #     try:
        #         trend_date_idx = str(row["trending_date"]).index("T")
        #         trend_date =  row["trending_date"][:trend_date_idx]
        #     except ValueError :
        #         continue  # poor formating of date field in csv, don't add
        #     tags = row["tags"].replace("'", "''")
        #     if (tags == "[None]"):
        #         tags = ""
        #     # descr = str(row["description"]).replace("'", "''") # **DID NOT ADD DESCRIPTION 
        #     category = row["categoryId"]
        #     views = row["view_count"]
        #     likes = row["likes"]
        #     dislikes = row["dislikes"]
        #     comments = row["comment_count"]
        #     # print("Video ID", videoid, "Title", title, "Category", category)
        #     sql1 = "INSERT IGNORE  INTO Video Values('%s', '%s', '%s','%s','%s','%s','%s','%s','%s' );" % (videoid,channel,category,title,date," https://www.youtube.com/watch?v="+videoid, "USA", tags, "")
        #     sql2 = "INSERT  INTO TrendingStats Values('%s', '%s', '%s','%s','%s', '%s');" % (trend_date,videoid,likes,dislikes,views,comments)
        #     cursor.execute(sql1)
        #     cursor.execute(sql2)
            
        #     sql = "INSERT IGNORE INTO Channel  Values('%s', '%s');" % (val1,val2)
        #     cursor.execute(sql)

        # Parse Category JSON
        # # f = open('category.json')
        # category = json.load(f)
        # catID = {}
        # for item in category['items']:
        #     id  = item["id"]
        #     catID[id] = item["snippet"]["title"]
        # f.close()
        # print(len(catID.keys()))
        # for key in catID:
        #     sql = "INSERT IGNORE INTO Category  Values('%s', '%s');" % (key,catID[key])
        #     cursor.execute(sql)
        # f.close()
        conn.commit()
        cursor.close()
    conn.close()
except Error as e:
    print("Error while connecting to MySQL", e)
