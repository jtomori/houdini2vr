"""
Preview your Houdini VR renders in HMD

It takes image from displayed image plane in Render View pane and displays it in your HMD
"""

import os
import hou
import base64
import logging
import numpy as np
from PIL import Image

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

def getImageData():
    """
    Returns a dictionary with information about displayed image

    it contains:
        img_plane - string with name of displayed image plane
        res - tuple of two ints for X and Y image resolution
        pixels - tuple of pixel tuples (4 floats, RGBA), in row-major order starting at the bottom left corner of the image
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
            img_plane = viewer.displayedPlane()
            
            img_data["img_plane"] = img_plane
            img_data["res"] = viewer.imageResolution()
            img_data["pixels"] = viewer.pixels(img_plane)

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

def saveImageAsPng(img_data):
    """
    Saves incoming data as gamma-corrected PNG into $HIP/tmp/tmp.png
    """
    pixels = img_data["pixels"]
    res = img_data["res"]

    pixels = np.array(pixels)
    pixels = pixels.reshape(res[1], res[0], 4)
    pixels = np.flip(pixels, 0)
    pixels[:,:,:3] = pixels[:,:,:3]**(1/2.2)

    pixels *= 255

    folder_path = os.path.join(hou.getenv("HIP"), "tmp")
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    img_path = os.path.join(folder_path, "tmp.png")

    png_img = Image.fromarray(pixels.astype(np.uint8))
    png_img.save(img_path)

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