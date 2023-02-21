import os
import datetime
import subprocess as exec

def read_file(s: str) -> str:
    with open(s) as t:
        return t.read()

def get_current_date():
    TIME_ZONE = "+0800"
    post_createat = datetime.datetime.now()
    short_time = post_createat.strftime('%Y-%m-%d')
    long_time = post_createat.strftime('%Y-%m-%d %H:%M:%S ') + TIME_ZONE
    return {"short": short_time, "long": long_time}


PATH_TO_TOOLS = os.getcwd() + "/assets/tools/"
PATH_TO_TOOLS_SOURCE = PATH_TO_TOOLS + "source/"

def uglify_tools_script():
    source_files = list(filter(lambda x: x.endswith(".js"), os.listdir(PATH_TO_TOOLS_SOURCE)))
    for source_file in source_files:
        source_path = PATH_TO_TOOLS_SOURCE + source_file
        target_path = PATH_TO_TOOLS + source_file[:-3] + ".min.js"
        exec.run(["uglifyjs", source_path, "-o", target_path, "-c", "-m", "--source-map"], capture_output=True)
        print("Uglify " + source_file + " successful.")