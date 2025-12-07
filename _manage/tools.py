import os
import datetime

def read_file(s: str) -> str:
    with open(s) as t:
        return t.read()

def get_current_date():
    TIME_ZONE = "+0800"
    post_createat = datetime.datetime.now()
    short_time = post_createat.strftime('%Y-%m-%d')
    long_time = post_createat.strftime('%Y-%m-%d %H:%M:%S ') + TIME_ZONE
    return {"short": short_time, "long": long_time}