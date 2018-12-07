import sys
import traceback
from IFDapi import *

def post_iprplane(channel):
    """
    Will get called for each IPR plane
    """
    #sys.__stderr__.write("\nCurrent image plane: {}\n".format(channel))
    return False

def post_render(cam, now, objlist, lightlist, spacelist, foglist, fromlight, forphoton, cubemap, viewcam):
    """
    Should get called after render, but actually gets called after pressing button Render, before the render starts
    """
    #sys.__stderr__.write("\nLocals: {}\n".format(locals()))
    return False

#List of hooks in this file
_HOOKS = {
    'post_iprplane'     : post_iprplane,
    'post_render'       : post_render
}

def call(name='', *args, **kwargs):
    """
        Hook callback function
    """
    method = _HOOKS.get(name, None)
    if method:
        try:
            if method(*args, **kwargs):
                return True
            else:
                return False
        except Exception, err:
            ray_comment('Hook Error[%s]: %s %s' % (name, __file__, str(err)))
            ray_comment('Traceback:\n# %s\n' %
                        '\n#'.join(traceback.format_exc().split('\n')))
    return False
