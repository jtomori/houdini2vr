AFRAME.registerShader('uv-show', {
    /*
    A simple debug shader showing UV coordinates as colors
    */
    raw: false,
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        varying vec2 vUv;

        void main () {
            gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
        }
    `
});

AFRAME.registerShader('vr-map', {
    /*
    Shader to display offline VR renders which contain both eyes in one texture
    */
    schema: {
        src:                        {type: 'map', is: 'uniform'},
        stereo:                     {type: 'int', is: 'uniform'},
        left_right_or_top_bottom:   {type: 'int', is: 'uniform'},
        left_or_right:              {type: 'int', is: 'uniform'}
    },
    raw: true,
    vertexShader: `
        attribute vec2 uv;
        attribute vec3 position;

        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform int stereo;
        uniform int left_right_or_top_bottom;
        uniform int left_or_right;

        varying vec2 vUv;

        void main() {
            float offset = 0.0;
            if (left_or_right == 0)
                offset = 0.0;
            else if (left_or_right == 1)
                offset = 0.5;

            if (stereo == 1)
            {
                if (left_right_or_top_bottom == 0)
                {
                    vUv = vec2(uv.x/2.0+offset, uv.y);
                }
                else if (left_right_or_top_bottom == 1)
                {
                    vUv = vec2(uv.x, uv.y/2.0+offset);
                }
            }
            if (stereo == 0)
                vUv = vec2(uv.x, uv.y);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision highp float;
        uniform sampler2D src;
        varying vec2 vUv;

        void main () {
            vec2 uv = vUv;
            vec4 texColor = texture2D(src, uv);
            gl_FragColor = texColor;
        }
    `
});
