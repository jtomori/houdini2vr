"""
Preview your Houdini VR renders in HMD
"""

import os
import hou
import base64
import thread
import inspect
import logging
import urllib2
import webbrowser
import numpy as np
import SocketServer
from PIL import Image
import SimpleHTTPServer
from pathlib2 import Path

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

web_server_address = "127.0.0.1"
web_server_port = 8000

def getCameraInfo(viewer):
    """
    Returns a dictionary with information about camera rendering in passed IPR:
        layout: integer representing camera layout
            0: left - right
            1: top - bottom
    
    default values are 0 - if ROP node was not implemented (parm names change between renderers)
    """
    rop_node = viewer.ropNode()
    cam_node = rop_node.parm("camera").evalAsNode()
    
    out_dict = {
        "layout"    :       0,
        "stereo"    :       0
    }

    if rop_node.type().name() == "ifd": # Mantra
        layout = cam_node.parm("vrlayout").eval()

        out_dict["layout"] = layout
        if layout < 2:
            out_dict["stereo"] = 1
    else: # Not implemented warning
        log.warning("ROP node is not implemented")
    
    return out_dict

def getImageData():
    """
    Returns a dictionary with information about displayed image

    it contains:
        img_plane - string with name of displayed image plane
        res - tuple of two ints for X and Y image resolution
        pixels - tuple of pixel tuples (4 floats, RGBA), in row-major order starting at the bottom left corner of the image
        layout - an integer representing camera layout
    """
    viewer = hou.ui.paneTabOfType(hou.paneTabType.IPRViewer)
    img_data = {}
    
    if not viewer:
        log.warning("No Render View pane found")
        return None
    else:
        if viewer.planes() == ():
            log.warning("No image planes found, is your scene rendered?")
            return None
        else:
            cam_info = getCameraInfo(viewer)
            img_plane = viewer.displayedPlane()
            
            img_data["img_plane"] = img_plane
            img_data["res"] = viewer.imageResolution()
            img_data["pixels"] = viewer.pixels(img_plane)
            img_data["layout"] = cam_info["layout"]
            img_data["stereo"] = cam_info["stereo"]

            return img_data

def plotImage(img_data):
    """
    Plots gama-corrected image using matplotlib
    Depends on matplotlib
    """
    import matplotlib
    matplotlib.use("Qt5Agg")
    import matplotlib.pyplot as plt

    pixels = img_data["pixels"]
    res = img_data["res"]

    pixels = np.array(pixels)
    pixels = pixels.reshape(res[1], res[0], 4)
    pixels = np.flip(pixels, 0)

    pixels[:,:,:3] = pixels[:,:,:3]**(1/2.2)

    fig2d = plt.figure()
    plot = fig2d.add_subplot(111)
    imgplot = plt.imshow(pixels)
    plot.set_title(img_data["img_plane"])

    plt.show()

    return

def saveImageAsPng(img_data, path=None):
    """
    Saves incoming data as gamma-corrected PNG in specified path, or in $HIP/tmp/tmp.png if not specified
    """
    if not path:
        folder_path = Path(hou.getenv("HIP"), "tmp")
        if not folder_path.exists():
            os.makedirs(str(folder_path))
        img_path = folder_path / "tmp.png"
    else:
        img_path = path

    pixels = img_data["pixels"]
    res = img_data["res"]

    pixels = np.array(pixels)
    pixels = pixels.reshape(res[1], res[0], 4)
    pixels = np.flip(pixels, 0)
    pixels[:,:,:3] = pixels[:,:,:3]**(1/2.2)

    pixels *= 255

    png_img = Image.fromarray(pixels.astype(np.uint8))
    png_img.save(str(img_path))
    log.info("Saving image into {}".format(str(img_path)))

def isServerRunning():
    """
    Checks whether server is running or not
    returns True if connection can be made or False if not
    """
    try:
        os.environ["no_proxy"] = "127.0.0.1,localhost" # fixes a problem when behing a proxy
        urllib2.urlopen("http://{}:{}".format(web_server_address, web_server_port), timeout=1)
        return True
    except urllib2.URLError: 
        return False

def startServer():
    """
    Starts a simple httpserver at specified address and port (specified through global vars)
    """
    handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer((web_server_address, web_server_port), handler)
    log.info("Starting web server at port {}".format(web_server_port))
    httpd.serve_forever()

def showInWebBrowser():
    """
    Saves image in a tmp location, launches web server if not already running and launches web-browser which displays render image in VR
    """
    root = Path(__file__).parents[2]
    tmp = root / "tmp" / os.environ["USER"]
    img = tmp / "tmp.png"
    img_relative = img.relative_to(root)
    if not tmp.exists():
        os.makedirs(str(tmp))

    img_data = getImageData()
    
    if img_data:
        saveImageAsPng(img_data=img_data, path=img)

        if isServerRunning():
            log.info("Server is running")
        else:
            log.info("Server is not running, starting...")
            os.chdir(str(root))
            thread.start_new_thread(startServer, tuple())
        
        webbrowser.open_new_tab(url="http://{address}:{port}/web/index.html?img_path={img}&left_right_or_top_bottom={layout}&stereo={stereo}".format( address=web_server_address, port=web_server_port, img="/" + str(img_relative).replace("\\", "/"), layout=img_data["layout"],stereo=img_data["stereo"] ))

def encodeImage(img_data):
    """
    Encodes image into base64

    TODO:   * check if it produces identical results with decodeImage()
    """
    res = img_data["res"]
    pixels = img_data["pixels"]

    pixels_array = np.array(pixels)
    
    pixels_array = pixels_array.reshape(res[1], res[0], 4)
    pixels_array = np.flip(pixels_array, 0)
    pixels_array[:,:,:3] = pixels_array[:,:,:3]**(1/2.2)
    pixels_array = pixels_array.flatten()
    
    pixels_array *= 255
    
    return base64.b64encode( pixels_array.astype(np.uint8) )

def decodeImage(img_string):
    """
    Decodes image from base64

    TODO:   * this seems not to work properly, produces different results, maybe flipped?
            * get somehow resolution in
    """
    pixels = np.frombuffer(base64.b64decode(img_string), np.uint8)
    pixels = pixels.reshape(10, 10, 4)
    pixels = pixels.astype(np.float32) / 255
    
    return pixels