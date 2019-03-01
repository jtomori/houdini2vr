# Houdini 2 VR
## Preview Houdini VR renders in HMD
This tool takes displayed image plane in Render View pane and displays it in your VR headset. 

Note that this tool can be used also without a headset. In this case it will be displayed as a panorama image.

<br>

### Setup
* Add this repository into **HOUDINI_PATH** environment variable (e.g. in *houdini.env* file)
    ```
    HOUDINI_PATH = &;/home/juraj/Work/houdini_hmd_preview/
    ```
* Enable **Houdini 2 VR** shelf

<br>

### Usage
* **Save as PNG** - saves rendered image in *$HIP/tmp/tmp.png*
* **Start auto save** - starts auto-saving thread at a specified time interval *(specified in `hou2vr.py`)*
* **Show in browser** - starts a local web server if not already running, saves currently rendered image to temp directory and opens a web browser with the image
* **Stop auto save** - stops auto-saving thread

<br>

### Supported renderers, devices
This tool can support any renderer plugin which can render into Houdini's **Render View** pane. It has been tested with the following renderers:
* Mantra
* Arnold
* Redshift
    * *Note: you need to make sure that **Linked ROP** parameter on your **Redshift_IPR** node is pointing to the corresponding **Redshift** node.*

You can read about supported browsers and HMDs [here](https://webvr.rocks/).

If your renderer is missing then let me know, it can be easily added.

<br>

### Future work
* Move saving at Houdini side to a separate process - to minimze lags in Houdini UI
    * using shared memory?
* Send values from Houdini directly to browser (to skip image saving/loading times) and support HDR images
    * using websockets?

<br>

### Limitations
* HDR renderings are currently clamped because of transfering them as a PNG file

<br>

### Contributing
Feel free to contribute to this project by creating pull requests or by [buying me a beer :)](https://www.paypal.me/jtomori)
