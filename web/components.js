AFRAME.registerComponent("load-map", {
    /*
    Reads img_path parameter from url and sets its value to src property of material component - assigns a texture
    */
    init: function () {
        // get img_path parameter from url
        var img_path = AFRAME.utils.getUrlParameter("img_path");

        // check if img_path parameter was found
        if (img_path === "")
            console.error("img_path parameter not found in url");
        else
        {
            // modify texture path - set src property in material component
            this.el.setAttribute("material", {src: img_path});
        }
    }
});

AFRAME.registerComponent("vr-material", {
    /*
    Sets entity's shader to vr-map and sets layout and stereo properties on material (used by vr-map shader)
    */
    init: function () {
        // get parameters from url
        var layout = AFRAME.utils.getUrlParameter("layout");
        var stereo = AFRAME.utils.getUrlParameter("stereo");
        
        // set shader to vr-map
        var el = this.el;
        el.setAttribute("material", "shader", "vr-map");

        // check if parameters were found and modify material properties
        if (stereo === "")
        {
            console.warn("stereo parameter was not found in the url, assuming mono mode (the same as stereo=0)");
            el.setAttribute("material", "stereo", 0);
        }
        else
            el.setAttribute("material", "stereo", stereo);

        if (stereo === "1" && layout === "" )
            console.warn("stereo is enabled and layout parameter was not found in the url");
        else
        {
            el.setAttribute("material", "layout", layout);
        }
    }
});

AFRAME.registerComponent("stereo", {
    /*
    Sets eye property on material (used by vr-map shader) for corresponding eye and assigns it to the expected layer (used by stereo camera rig in VR mode)
    */
    schema: {
        eye:    {type: "string", default: "left"}
    },
    update: function (old_data) {
        var data = this.data;
        var el = this.el;
        
        if (data.eye !== old_data.eye)
        {
            var object_3D = this.el.object3D.children[0];
            
            // move (and disable all other layers, e.g. default 0) to layer 1 for left eye and 2 for right eye
            if (data.eye === "left")
            {
                object_3D.layers.set(1);
                el.setAttribute("material", "eye", 0);
            }
            else if (data.eye === "right")
            {
                object_3D.layers.set(2);
                el.setAttribute("material", "eye", 1);
            }
            
            console.log(`Eye set on "${this.el.id}" to "${this.data.eye}"`);
        }
    }
});

AFRAME.registerComponent("stereo-cam", {
    /*
    Assigns mono camera (in non-VR mode) to layers - lets you enable which objects to see
    */
    init: function () {
        var children_types = [];

        this.el.object3D.children.forEach( function (item, index, array) {
            children_types[index] = item.type;
        });

        var root_index = children_types.indexOf("PerspectiveCamera");
        var rootCam = this.el.object3D.children[root_index];
        
        // add layers 1 and 2 to the camera (0 is on by default)
        rootCam.layers.enable(1);
        rootCam.layers.enable(2);
    }
});

AFRAME.registerComponent("print-layers", {
    /*
    Prints layer mask, layers numbering is going from right to left
    */
    update: function () {
        var object_3D = this.el.object3D.children[0];
        console.log(`layer mask for "${this.el.id}" is "${(object_3D.layers.mask).toString(2)}"`);
    }
});

AFRAME.registerComponent("set-name", {
    /*
    Sets Object3D name to ID of the entity
    */
    init: function () {
        var object_3D = this.el.object3D.children[0];
        object_3D.name = this.el.id;
    }
});

AFRAME.registerComponent("print-scene-graph", {
    /*
    Prints scene graph
    */
    update: function () {
        print_graph(this.el.object3D);
    }
});

function print_graph(obj) {
    /* 
    Traverses three scene and prints a scene graph
    */
    console.group(obj.name + ' <%o> ', obj);
    obj.children.forEach( print_graph );
    console.groupEnd();
};
