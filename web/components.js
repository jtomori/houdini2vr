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
    Sets entity's shader to vr-map and sets left_right_or_top_bottom and left_or_right properties based on parameters in url
    */
    init: function () {
        // get parameters from url
        var left_right_or_top_bottom = AFRAME.utils.getUrlParameter("left_right_or_top_bottom");
        var left_or_right = AFRAME.utils.getUrlParameter("left_or_right");
        var stereo = AFRAME.utils.getUrlParameter("stereo");
        
        // set shader to vr-map
        var el = this.el;
        el.setAttribute("material", "shader", "vr-map");

        // check if parameters were found and modify material properties
        if (stereo === "")
            console.warn("stereo parameter was not found in url");
        else
            el.setAttribute("material", "stereo", stereo);

        if (stereo === "1" && left_right_or_top_bottom === "")
            console.warn("stereo is enabled and left_right_or_top_bottom parameter was not found in url");
        else
            el.setAttribute("material", "left_right_or_top_bottom", left_right_or_top_bottom);

        // left_or_right is optional and used more for debugging
        if (left_or_right === "")
            console.log("left_or_right parameter was not found in url");
        else
            el.setAttribute("material", "left_or_right", left_or_right);
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

AFRAME.registerComponent("stereo", {
    /*
    TBD
    */
    schema: {
        eye:    {type: "string", default: "left"}
    },
    update: function (old_data) {
        var data = this.data;
        
        if (data.eye !== old_data.eye)
        {
            var object_3D = this.el.object3D.children[0];
            
            // move (and disable all other layers, e.g. default 0) to layer 1 for left eye and 2 for right eye
            if (data.eye === "left")
                object_3D.layers.set(1);
            else if (data.eye === "right")
                object_3D.layers.set(2);

            console.log(`Eye set on "${this.el.id}" to "${this.data.eye}"`);
        }
    }
});

AFRAME.registerComponent("stereo-cam", {
    /*
    TBD
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
