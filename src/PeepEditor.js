// Get the latest version: https://github.com/Manticore-007/OpenRCT2-PeepEditor
!(function() {
    'use strict';
    var e, t = '23.11.29', n = 'undefined' != typeof ui;
    function o() {
        for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    }
    !(function(e) {
        e[e.Black = 0] = 'Black', e[e.Grey = 1] = 'Grey', e[e.White = 2] = 'White', e[e['Dark purple'] = 3] = 'Dark purple', 
        e[e['Light purple'] = 4] = 'Light purple', e[e['Bright purple'] = 5] = 'Bright purple', 
        e[e['Dark blue'] = 6] = 'Dark blue', e[e['Light blue'] = 7] = 'Light blue', e[e['Icy blue'] = 8] = 'Icy blue', 
        e[e['Dark Water'] = 9] = 'Dark Water', e[e['Light water'] = 10] = 'Light water', 
        e[e['Saturated green'] = 11] = 'Saturated green', e[e['Dark green'] = 12] = 'Dark green', 
        e[e['Moss green'] = 13] = 'Moss green', e[e['Bright green'] = 14] = 'Bright green', 
        e[e['Olive green'] = 15] = 'Olive green', e[e['Dark olive green'] = 16] = 'Dark olive green', 
        e[e['Bright yellow'] = 17] = 'Bright yellow', e[e.Yellow = 18] = 'Yellow', e[e['Dark yellow'] = 19] = 'Dark yellow', 
        e[e['Pastel Orange'] = 20] = 'Pastel Orange', e[e['Dark orange'] = 21] = 'Dark orange', 
        e[e['Light brown'] = 22] = 'Light brown', e[e['Saturated brown'] = 23] = 'Saturated brown', 
        e[e['Dark brown'] = 24] = 'Dark brown', e[e['Salmon pink'] = 25] = 'Salmon pink', 
        e[e['Bordeaux red'] = 26] = 'Bordeaux red', e[e['Saturated red'] = 27] = 'Saturated red', 
        e[e['Bright red'] = 28] = 'Bright red', e[e['Dark pink'] = 29] = 'Dark pink', e[e['Bright pink'] = 30] = 'Bright pink', 
        e[e['Light pink'] = 31] = 'Light pink', e[e['Army green'] = 32] = 'Army green', 
        e[e.Honeydew = 33] = 'Honeydew', e[e.Tan = 34] = 'Tan', e[e.Maroon = 35] = 'Maroon', 
        e[e['Coral pink'] = 36] = 'Coral pink', e[e['Forest green'] = 37] = 'Forest green', 
        e[e.Chartreuse = 38] = 'Chartreuse', e[e['Hunter green'] = 39] = 'Hunter green', 
        e[e.Celadon = 40] = 'Celadon', e[e['Lime green'] = 41] = 'Lime green', e[e.Sepia = 42] = 'Sepia', 
        e[e.Peach = 43] = 'Peach', e[e.Periwinkle = 44] = 'Periwinkle', e[e.Viridian = 45] = 'Viridian', 
        e[e['Seafoam green'] = 46] = 'Seafoam green', e[e.Violet = 47] = 'Violet', e[e.Lavender = 48] = 'Lavender', 
        e[e['Orange light'] = 49] = 'Orange light', e[e['Deep water'] = 50] = 'Deep water', 
        e[e['Pastel pink'] = 51] = 'Pastel pink', e[e.Umber = 52] = 'Umber', e[e.Beige = 53] = 'Beige', 
        e[e.Invisible = 54] = 'Invisible', e[e.Void = 55] = 'Void';
    })(e || (e = {}));
    var g = Object.keys(e).filter((function(e) {
        return isNaN(Number(e));
    })), i = 'peep-editor-window', A = e['Dark yellow'], c = 14, C = 24, r = [ '1x', '10x', '100x' ], a = 1, I = null;
    function u() {
        h(), ui.getWindow(i).findWidget('viewport-peep').viewport.moveTo({
            x: -9e3,
            y: -9e3,
            z: 9e3
        });
    }
    function h() {
        null == I || I.dispose(), I = null;
    }
    var l, p = {
        type: 'groupbox',
        name: 'groupbox-about-version',
        x: 5,
        y: 17,
        height: 35,
        width: 190,
        text: 'Version'
    }, s = [ p, {
        type: 'label',
        name: 'label-about-version',
        x: 5,
        y: p.y + p.height / 2.5,
        height: c,
        width: 190,
        text: '{WHITE}'.concat(t),
        textAlign: 'centred'
    }, {
        type: 'label',
        name: 'label-peep-editor',
        x: 5,
        y: p.y + p.height + 5,
        height: c,
        width: 190,
        text: 'Peep Editor, a plugin for OpenRCT2',
        textAlign: 'centred'
    }, {
        type: 'custom',
        name: 'custom-widget-manticore',
        x: 15,
        y: 95,
        width: 128,
        height: 128
    }, {
        type: 'label',
        name: 'label-special-thanks-people',
        x: 5,
        y: 121,
        height: 200,
        width: 190,
        text: 'Special thanks:\n Basssiiie\n ltsSmitty\n Gymnasiast\n Sadret\n Enox',
        textAlign: 'centred'
    }, {
        type: 'label',
        name: 'label-github-page',
        x: 5,
        y: 185,
        height: c,
        width: 190,
        text: 'https://github.com/Manticore-007/OpenRCT2-PeepEditor',
        textAlign: 'centred'
    } ];
    function f(e, t, n) {
        return {
            guestId: e.id,
            property: t,
            colour: n
        };
    }
    function x(e, t, n) {
        return {
            guestId: e.id,
            key: t,
            value: n
        };
    }
    !(function(e) {
        e[e.trousers = 0] = 'trousers';
    })(l || (l = {}));
    var d, m = [], y = function(e) {
        return m[l[e]];
    }, b = 18, w = 18, k = 18, v = 18, z = 18, D = {
        type: 'groupbox',
        name: 'groupbox-attribute-colours',
        text: 'Attribute colours',
        x: 5,
        y: 17,
        height: 35,
        width: 190
    }, P = [ D, {
        type: 'custom',
        name: 'custom-widget-tshirt',
        x: 9,
        y: D.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            M(e, 5081, b);
        }
    }, {
        type: 'colourpicker',
        name: 'colourpicker-tshirt',
        x: 27,
        y: D.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            b = e, map.getAllEntities('guest').forEach((function(t) {
                return context.executeAction('pe_setguestcolour', f(t, 'tshirtColour', e));
            }));
        }
    }, {
        type: 'custom',
        name: 'custom-widget-trousers',
        x: 45,
        y: D.height / 2 + c - 2,
        width: 16,
        height: 16,
        onDraw: function(e) {
            M(e, y('trousers'), w);
        }
    }, {
        type: 'colourpicker',
        name: 'colourpicker-trousers',
        x: 63,
        y: D.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            w = e, map.getAllEntities('guest').forEach((function(t) {
                return context.executeAction('pe_setguestcolour', f(t, 'trousersColour', e));
            }));
        }
    }, {
        type: 'custom',
        name: 'custom-widget-hat',
        x: 81,
        y: D.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            M(e, 5079, k);
        }
    }, {
        type: 'colourpicker',
        name: 'colourpicker-hat',
        x: 99,
        y: D.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            k = e, map.getAllEntities('guest').forEach((function(t) {
                return context.executeAction('pe_setguestcolour', f(t, 'hatColour', e));
            }));
        }
    }, {
        type: 'custom',
        name: 'custom-widget-balloon',
        x: 117,
        y: D.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            M(e, 5061, v);
        }
    }, {
        type: 'colourpicker',
        name: 'colourpicker-balloon',
        x: 135,
        y: D.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            v = e, map.getAllEntities('guest').forEach((function(t) {
                return context.executeAction('pe_setguestcolour', f(t, 'balloonColour', e));
            }));
        }
    }, {
        type: 'custom',
        name: 'custom-widget-umbrella',
        x: 153,
        y: D.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            M(e, 5065, z);
        }
    }, {
        type: 'colourpicker',
        name: 'colourpicker-umbrella',
        x: 171,
        y: D.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            z = e, map.getAllEntities('guest').forEach((function(t) {
                return context.executeAction('pe_setguestcolour', f(t, 'umbrellaColour', e));
            }));
        }
    }, {
        type: 'groupbox',
        name: 'groupbox-flags',
        text: 'Flags',
        x: 5,
        y: D.y + D.height,
        height: 160,
        width: 190
    }, {
        type: 'checkbox',
        name: 'checkbox-leaving-park',
        x: 19,
        y: 64,
        height: c,
        width: 250,
        text: 'Leaving park',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'leavingPark', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-slow-walk',
        x: 19,
        y: 77,
        height: c,
        width: 250,
        text: 'Slow walk',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'slowWalk', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-tracking',
        x: 19,
        y: 90,
        height: c,
        width: 250,
        text: 'Tracking',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'tracking', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-waving',
        x: 19,
        y: 103,
        height: c,
        width: 250,
        text: 'Waving',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'waving', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-painting',
        x: 19,
        y: 116,
        height: c,
        width: 250,
        text: 'Painting',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'painting', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-photo',
        x: 19,
        y: 129,
        height: c,
        width: 250,
        text: 'Photo',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'photo', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-wow',
        x: 19,
        y: 142,
        height: c,
        width: 250,
        text: 'Wow!',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'wow', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-litter',
        x: 19,
        y: 155,
        height: c,
        width: 250,
        text: 'Litter',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'litter', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-lost',
        x: 19,
        y: 168,
        height: c,
        width: 250,
        text: 'Lost',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'lost', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-hunger',
        x: 19,
        y: 181,
        height: c,
        width: 250,
        text: 'Hunger',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'hunger', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-here-we-are',
        x: 19,
        y: 194,
        height: c,
        width: 250,
        text: 'Here we are',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'hereWeAre', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-toilet',
        x: 110,
        y: 64,
        height: c,
        width: 250,
        text: 'Toilet',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'toilet', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-crowded',
        x: 110,
        y: 77,
        height: c,
        width: 250,
        text: 'Crowded',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'crowded', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-happiness',
        x: 110,
        y: 90,
        height: c,
        width: 250,
        text: 'Happiness',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'happiness', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-nausea',
        x: 110,
        y: 103,
        height: c,
        width: 250,
        text: 'Nausea',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'nausea', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-purple',
        x: 110,
        y: 116,
        height: c,
        width: 250,
        text: 'Purple',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'purple', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-pizza',
        x: 110,
        y: 129,
        height: c,
        width: 250,
        text: 'Pizza',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'pizza', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-explode',
        x: 110,
        y: 142,
        height: c,
        width: 250,
        text: 'Explode',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'explode', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-contagious',
        x: 110,
        y: 155,
        height: c,
        width: 250,
        text: 'Contagious',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'contagious', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-joy',
        x: 110,
        y: 168,
        height: c,
        width: 250,
        text: 'Joy',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'joy', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-angry',
        x: 110,
        y: 181,
        height: c,
        width: 250,
        text: 'Angry',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'angry', e));
            }));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-ice-cream',
        x: 110,
        y: 194,
        height: c,
        width: 250,
        text: 'Ice cream',
        onChange: function(e) {
            map.getAllEntities('guest').forEach((function(t) {
                context.executeAction('pe_setflag', x(t, 'iceCream', e));
            }));
        }
    } ];
    function M(e, t, n) {
        var o = e.getImage(t);
        o && (e.paletteId = n, e.image(o.id, 0, 0));
    }
    !(function(e) {
        e.handyman = 'Handyman', e.mechanic = 'Mechanic', e.security = 'Security guard', 
        e.entertainer = 'Entertainer';
    })(d || (d = {}));
    var j, S, N, B = [ 'handyman', 'mechanic', 'security', 'entertainer' ], E = [ d.handyman, d.mechanic, d.security, d.entertainer ], T = -1, O = -1, L = {
        type: 'groupbox',
        name: 'groupbox-attribute-colours',
        text: 'Attribute colours',
        x: 5,
        y: 17,
        height: 35,
        width: 190
    }, Z = {
        type: 'colourpicker',
        name: 'colourpicker-tshirt',
        x: 27,
        y: L.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            context.executeAction('pe_setguestcolour', f(j, 'tshirtColour', e));
        }
    }, H = {
        type: 'colourpicker',
        name: 'colourpicker-trousers',
        x: 63,
        y: L.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            context.executeAction('pe_setguestcolour', f(j, 'trousersColour', e));
        }
    }, G = {
        type: 'colourpicker',
        name: 'colourpicker-hat',
        x: 99,
        y: L.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            context.executeAction('pe_setguestcolour', f(j, 'hatColour', e));
        }
    }, W = {
        type: 'colourpicker',
        name: 'colourpicker-balloon',
        x: 135,
        y: L.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            context.executeAction('pe_setguestcolour', f(j, 'balloonColour', e));
        }
    }, U = {
        type: 'colourpicker',
        name: 'colourpicker-umbrella',
        x: 171,
        y: L.height / 2 + c,
        height: c,
        width: c,
        colour: A,
        onChange: function(e) {
            context.executeAction('pe_setguestcolour', f(j, 'umbrellaColour', e));
        }
    }, R = [ L, {
        type: 'custom',
        name: 'custom-widget-tshirt',
        x: 9,
        y: L.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            X(e, 5081, 'tshirtColour');
        }
    }, Z, {
        type: 'custom',
        name: 'custom-widget-trousers',
        x: 45,
        y: L.height / 2 + c - 2,
        width: 16,
        height: 16,
        onDraw: function(e) {
            X(e, y('trousers'), 'trousersColour');
        }
    }, H, {
        type: 'custom',
        name: 'custom-widget-hat',
        x: 81,
        y: L.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            X(e, 5079, 'hatColour');
        }
    }, G, {
        type: 'custom',
        name: 'custom-widget-balloon',
        x: 117,
        y: L.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            X(e, 5061, 'balloonColour');
        }
    }, W, {
        type: 'custom',
        name: 'custom-widget-umbrella',
        x: 153,
        y: L.height / 2 + c,
        width: 16,
        height: 16,
        onDraw: function(e) {
            X(e, 5065, 'umbrellaColour');
        }
    }, U, {
        type: 'groupbox',
        name: 'groupbox-flags',
        text: 'Flags',
        x: 5,
        y: L.y + L.height,
        height: 160,
        width: 190
    }, {
        type: 'checkbox',
        name: 'checkbox-leaving-park',
        x: 19,
        y: 64,
        height: c,
        width: 250,
        text: 'Leaving park',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'leavingPark', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-slow-walk',
        x: 19,
        y: 77,
        height: c,
        width: 250,
        text: 'Slow walk',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'slowWalk', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-tracking',
        x: 19,
        y: 90,
        height: c,
        width: 250,
        text: 'Tracking',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'tracking', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-waving',
        x: 19,
        y: 103,
        height: c,
        width: 250,
        text: 'Waving',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'waving', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-painting',
        x: 19,
        y: 116,
        height: c,
        width: 250,
        text: 'Painting',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'painting', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-photo',
        x: 19,
        y: 129,
        height: c,
        width: 250,
        text: 'Photo',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'photo', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-wow',
        x: 19,
        y: 142,
        height: c,
        width: 250,
        text: 'Wow!',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'wow', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-litter',
        x: 19,
        y: 155,
        height: c,
        width: 250,
        text: 'Litter',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'litter', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-lost',
        x: 19,
        y: 168,
        height: c,
        width: 250,
        text: 'Lost',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'lost', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-hunger',
        x: 19,
        y: 181,
        height: c,
        width: 250,
        text: 'Hunger',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'hunger', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-here-we-are',
        x: 19,
        y: 194,
        height: c,
        width: 250,
        text: 'Here we are',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'hereWeAre', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-toilet',
        x: 110,
        y: 64,
        height: c,
        width: 250,
        text: 'Toilet',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'toilet', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-crowded',
        x: 110,
        y: 77,
        height: c,
        width: 250,
        text: 'Crowded',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'crowded', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-happiness',
        x: 110,
        y: 90,
        height: c,
        width: 250,
        text: 'Happiness',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'happiness', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-nausea',
        x: 110,
        y: 103,
        height: c,
        width: 250,
        text: 'Nausea',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'nausea', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-purple',
        x: 110,
        y: 116,
        height: c,
        width: 250,
        text: 'Purple',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'purple', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-pizza',
        x: 110,
        y: 129,
        height: c,
        width: 250,
        text: 'Pizza',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'pizza', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-explode',
        x: 110,
        y: 142,
        height: c,
        width: 250,
        text: 'Explode',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'explode', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-contagious',
        x: 110,
        y: 155,
        height: c,
        width: 250,
        text: 'Contagious',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'contagious', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-joy',
        x: 110,
        y: 168,
        height: c,
        width: 250,
        text: 'Joy',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'joy', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-angry',
        x: 110,
        y: 181,
        height: c,
        width: 250,
        text: 'Angry',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'angry', e));
        }
    }, {
        type: 'checkbox',
        name: 'checkbox-ice-cream',
        x: 110,
        y: 194,
        height: c,
        width: 250,
        text: 'Ice cream',
        onChange: function(e) {
            context.executeAction('pe_setflag', x(j, 'iceCream', e));
        }
    } ];
    function X(t, n, o) {
        var g = t.getImage(n);
        if ('tshirtColour' === o || 'trousersColour' === o || 'hatColour' === o || 'umbrellaColour' === o || 'balloonColour' === o) {
            var i = j[o];
            g && (t.paletteId = i, t.image(g.id, 0, 0));
        } else g && (t.paletteId = e['Pastel Orange'], t.image(g.id, 0, 0));
    }
    !(function(e) {
        e[e.Panda = 0] = 'Panda', e[e.Tiger = 1] = 'Tiger', e[e.Elephant = 2] = 'Elephant', 
        e[e.Gladiator = 3] = 'Gladiator', e[e.Gorilla = 4] = 'Gorilla', e[e.Snowman = 5] = 'Snowman', 
        e[e.Knight = 6] = 'Knight', e[e.Astronaut = 7] = 'Astronaut', e[e.Bandit = 8] = 'Bandit', 
        e[e.Sheriff = 9] = 'Sheriff', e[e.Pirate = 10] = 'Pirate', e[e.Icecream = 11] = 'Icecream', 
        e[e.Chips = 12] = 'Chips', e[e.Burger = 13] = 'Burger', e[e['Soda can'] = 14] = 'Soda can', 
        e[e.Balloon = 15] = 'Balloon', e[e.Candyfloss = 16] = 'Candyfloss', e[e.Umbrella = 17] = 'Umbrella', 
        e[e.Pizza = 18] = 'Pizza', e[e.Security = 19] = 'Security', e[e.Popcorn = 20] = 'Popcorn', 
        e[e['Arms crossed'] = 21] = 'Arms crossed', e[e['Head down'] = 22] = 'Head down', 
        e[e.Nauseous = 23] = 'Nauseous', e[e['Very nauseous'] = 24] = 'Very nauseous', e[e['Needs toilet'] = 25] = 'Needs toilet', 
        e[e.Hat = 26] = 'Hat', e[e.Hotdog = 27] = 'Hotdog', e[e.Tentacle = 28] = 'Tentacle', 
        e[e['Toffee apple'] = 29] = 'Toffee apple', e[e.Donut = 30] = 'Donut', e[e.Coffee = 31] = 'Coffee', 
        e[e.Nuggets = 32] = 'Nuggets', e[e.Lemonade = 33] = 'Lemonade', e[e.Walking = 34] = 'Walking', 
        e[e.Pretzel = 35] = 'Pretzel', e[e.Sunglasses = 36] = 'Sunglasses', e[e.Sujongkwa = 37] = 'Sujongkwa', 
        e[e.Juice = 38] = 'Juice', e[e['Funnel cake'] = 39] = 'Funnel cake', e[e.Noodles = 40] = 'Noodles', 
        e[e.Sausage = 41] = 'Sausage', e[e.Soup = 42] = 'Soup', e[e.Sandwich = 43] = 'Sandwich', 
        e[e.Guest = 44] = 'Guest', e[e.Handyman = 45] = 'Handyman', e[e.Mechanic = 46] = 'Mechanic', 
        e[e['Security guard'] = 47] = 'Security guard';
    })(N || (N = {}));
    var Y = Object.keys(N).filter((function(e) {
        return isNaN(Number(e));
    }));
    function _(e, t, n) {
        return {
            staffId: e.id,
            axis: t,
            operator: n,
            multiplier: a
        };
    }
    function F(e, t, n) {
        return {
            staffId: e.id,
            axis: t,
            text: n
        };
    }
    function J(e, t) {
        return {
            staffId: e.id,
            operator: t
        };
    }
    var V = {
        type: 'groupbox',
        name: 'groupbox-appearance',
        text: 'Appearance',
        x: 5,
        y: 17,
        height: 73.5,
        width: 190
    }, Q = {
        type: 'label',
        name: 'label-staff-type',
        x: 15,
        y: V.y + c + 5,
        height: c,
        width: V.width - 10,
        text: 'Type: ',
        tooltip: 'Change the type of the selected staff member'
    }, K = {
        type: 'dropdown',
        name: 'dropdown-staff-type',
        x: 80,
        y: Q.y,
        height: c,
        width: 105,
        items: E,
        selectedIndex: -1,
        tooltip: 'Change the type of the selected staff member',
        onChange: function(e) {
            return context.executeAction('pe_changestafftype', (function(e, t) {
                return {
                    staffId: e.id,
                    staffType: t
                };
            })(j, e));
        }
    }, q = {
        type: 'label',
        name: 'label-costume',
        x: 15,
        y: Q.y + c + 1,
        height: c,
        width: V.width - 10,
        text: 'Costume: ',
        tooltip: 'Change the costume of the selected staff member'
    }, $ = {
        type: 'dropdown',
        name: 'dropdown-costume',
        x: 80,
        y: q.y,
        height: c,
        width: 105,
        items: Y,
        selectedIndex: -1,
        tooltip: 'Change the costume of the selected staff member',
        onChange: function(e) {
            return context.executeAction('pe_changestaffcostume', (function(e, t) {
                return {
                    staffId: e.id,
                    costume: t
                };
            })(j, e));
        }
    }, ee = {
        type: 'label',
        name: 'label-staff-colour',
        x: 15,
        y: q.y + c + 1,
        height: c,
        width: V.width - 10,
        text: 'Colour: ',
        tooltip: 'Change the colour of the staff member\'s outfit'
    }, te = {
        type: 'textbox',
        name: 'textbox-staff-colour',
        x: 80,
        y: ee.y,
        height: c,
        width: 105,
        isDisabled: !0,
        text: '',
        tooltip: 'Change the colour of the slected staff member\'s outfit'
    }, ne = {
        type: 'colourpicker',
        name: 'colourpicker-staff',
        x: 172,
        y: te.y + 1,
        height: c,
        width: c,
        colour: A,
        tooltip: 'Change the colour of the selected staff member\'s outfit',
        onChange: function(e) {
            return context.executeAction('pe_changestaffcolour', (function(e, t) {
                return {
                    staffId: e.id,
                    colour: t
                };
            })(j, e));
        }
    }, oe = {
        type: 'groupbox',
        name: 'groupbox-coordinates',
        text: 'Kinematics',
        x: 5,
        y: V.y + V.height + 5,
        height: 94.5,
        width: 190
    }, ge = {
        type: 'label',
        name: 'label-x-position',
        x: 15,
        y: oe.y + c + 5,
        height: c,
        width: V.width - 10,
        text: 'X position: ',
        tooltip: 'Finetune the position of the selected staff member on the map'
    }, ie = {
        type: 'label',
        name: 'label-y-position',
        x: 15,
        y: ge.y + c + 1,
        height: c,
        width: V.width - 10,
        text: 'Y position: ',
        tooltip: 'Finetune the position of the selected staff member on the map'
    }, Ae = {
        type: 'label',
        name: 'label-z-position',
        x: 15,
        y: ie.y + c + 1,
        height: c,
        width: V.width - 10,
        text: 'Z position: ',
        tooltip: 'Finetune the position of the selected staff member on the map'
    }, ce = {
        type: 'label',
        name: 'label-energy',
        x: 15,
        y: Ae.y + c + 7,
        height: c,
        width: V.width - 10,
        text: 'Speed: ',
        tooltip: 'Set speed of selected staff member between 1 and 255'
    }, Ce = {
        type: 'label',
        name: 'label-multiplier',
        x: 15,
        y: oe.y + oe.height + 5,
        height: c,
        width: V.width - 10,
        text: 'Multiplier: '
    }, re = [ V, ee, te, ne, Q, K, q, $, oe, ge, {
        type: 'spinner',
        name: 'spinner-x-position',
        x: 80,
        y: ge.y,
        height: c,
        width: 105,
        text: ' ',
        tooltip: 'Finetune the position of the selected staff member on the map',
        onClick: function() {
            return ui.showTextInput({
                title: 'X coordinate',
                description: 'Put in X coordinate to move staff member to',
                initialValue: j.x.toString(),
                callback: function(e) {
                    context.executeAction('pe_setstaffcoordinates', F(j, 'x', e));
                }
            });
        },
        onIncrement: function() {
            return context.executeAction('pe_changestaffcoordinates', _(j, 'x', 1));
        },
        onDecrement: function() {
            return context.executeAction('pe_changestaffcoordinates', _(j, 'x', -1));
        }
    }, ie, {
        type: 'spinner',
        name: 'spinner-y-position',
        x: 80,
        y: ie.y,
        height: c,
        width: 105,
        text: ' ',
        tooltip: 'Finetune the position of the selected staff member on the map',
        onClick: function() {
            return ui.showTextInput({
                title: 'Y coordinate',
                description: 'Put in Y coordinate to move staff member to',
                initialValue: j.y.toString(),
                callback: function(e) {
                    context.executeAction('pe_setstaffcoordinates', F(j, 'y', e));
                }
            });
        },
        onIncrement: function() {
            return context.executeAction('pe_changestaffcoordinates', _(j, 'y', 1));
        },
        onDecrement: function() {
            return context.executeAction('pe_changestaffcoordinates', _(j, 'y', -1));
        }
    }, Ae, {
        type: 'spinner',
        name: 'spinner-z-position',
        x: 80,
        y: Ae.y,
        height: c,
        width: 105,
        text: ' ',
        tooltip: 'Finetune the position of the selected staff member on the map',
        onClick: function() {
            return ui.showTextInput({
                title: 'Z coordinate',
                description: 'Put in Z coordinate to move staff member to',
                initialValue: j.z.toString(),
                callback: function(e) {
                    context.executeAction('pe_setstaffcoordinates', F(j, 'z', e));
                }
            });
        },
        onIncrement: function() {
            return context.executeAction('pe_changestaffcoordinates', _(j, 'z', 1));
        },
        onDecrement: function() {
            return context.executeAction('pe_changestaffcoordinates', _(j, 'z', -1));
        }
    }, ce, {
        type: 'spinner',
        name: 'spinner-energy',
        x: 80,
        y: ce.y,
        height: c,
        width: 105,
        text: ' ',
        tooltip: 'Set speed of selected staff member between 1 and 255',
        onClick: function() {
            0 !== j.energy && ui.showTextInput({
                title: 'Speed',
                description: 'Put in speed of staff member',
                initialValue: j.energy.toString(),
                callback: function(e) {
                    var t, n = parseInt(e);
                    context.executeAction('pe_setstaffenergy', (t = n, {
                        staffId: j.id,
                        speed: t
                    }));
                }
            });
        },
        onIncrement: function() {
            return context.executeAction('pe_changestaffenergy', J(j, 1));
        },
        onDecrement: function() {
            return context.executeAction('pe_changestaffenergy', J(j, -1));
        }
    }, Ce, {
        type: 'dropdown',
        name: 'dropdown-multiplier',
        x: 80,
        y: Ce.y,
        height: c,
        width: 105,
        items: r,
        selectedIndex: 0,
        isDisabled: !1,
        onChange: function(e) {
            return (function(e) {
                0 === e && (a = 1), 1 === e && (a = 10), 2 === e && (a = 100), o('Multiplier set to '.concat(r[e]));
            })(e);
        }
    } ];
    function ae(e) {
        switch (e) {
          case 'About':
            return s;

          case 'Guest properties':
            return R;

          case 'Staff member properties':
            return re;

          case 'All guests properties':
            return P;
        }
    }
    var Ie = null;
    function ue() {
        null == Ie || Ie.dispose(), Ie = null;
    }
    var he = null;
    function le() {
        null == he || he.dispose(), he = null;
    }
    var pe, se = null, fe = null;
    function xe() {
        null == fe || fe.dispose(), fe = null;
    }
    function de(e) {
        var t = ui.getWindow(i);
        pe && pe.title === e ? (o(''.concat(e, ' window is already shown')), pe.bringToFront()) : (pe && pe.close(), 
        pe = ui.openWindow({
            classification: 'side-window',
            title: e,
            width: 200,
            height: t.height,
            x: t.x + t.width,
            y: t.y,
            colours: [ A, A ],
            widgets: ae(e),
            onClose: function() {
                ue(), null == se || se.dispose(), se = null, le(), xe(), b = 18, w = 18, k = 18, 
                v = 18, z = 18;
            }
        }));
    }
    function me() {
        ui.getWindow(i).widgets.filter((function(e) {
            return 'button' === e.type;
        })).forEach((function(e) {
            e.isPressed = !1;
        }));
    }
    function ye(e) {
        var t = ui.getWindow(i).widgets.filter((function(t) {
            return t.name === e;
        }))[0];
        t.isPressed = !t.isPressed, o(''.concat(t.name, ' is ').concat(t.isPressed ? 'pressed' : 'unpressed'));
    }
    function be(e) {
        ui.getWindow(i).widgets.filter((function(t) {
            return t.name === e;
        }))[0].isDisabled = !0;
    }
    function we() {
        ui.getWindow(i).widgets.filter((function(e) {
            return 'button' === e.type;
        })).slice(2, 6).forEach((function(e) {
            e.isDisabled = !0;
        }));
    }
    function ke(e) {
        var t;
        xe(), t = context.subscribe('interval.tick', (function() {
            pe.findWidget('spinner-energy').text = e.energy.toString();
        })), fe = t;
    }
    function ve() {
        ui.getWindow(i).findWidget('label-peep-name').text = '{WHITE}'.concat(j.name);
    }
    var ze = 'remove-peep-window';
    function De(e) {
        return ui.getWindow(i).findWidget('button-all-guests').isPressed ? '{WHITE}Are you sure you want to remove\n all guests?' : '{WHITE}Are you sure you want to remove\n'.concat(e.name, '?');
    }
    var Pe = {
        type: 'groupbox',
        name: 'groupbox-name',
        text: 'Name',
        x: 5,
        y: 17,
        height: 35,
        width: 250
    }, Me = {
        type: 'label',
        name: 'label-peep-name',
        x: Pe.x + 5,
        y: Pe.y + Pe.height / 2.5,
        height: c,
        width: Pe.width - 10 - c,
        text: '{RED} No peep selected',
        textAlign: 'centred'
    }, je = {
        type: 'viewport',
        name: 'viewport-peep',
        x: 5,
        y: Pe.y + Pe.height + 5,
        height: 144,
        width: 226
    }, Se = {
        type: 'button',
        name: 'button-picker',
        x: je.x + je.width,
        y: je.y,
        height: C,
        width: C,
        image: context.getIcon('eyedropper'),
        isPressed: !1,
        tooltip: 'Select a peep to modify',
        onClick: function() {
            return ui.getWindow(i).findWidget('button-all-guests').isPressed && ye('button-all-guests'), 
            ui.getWindow(i).findWidget('button-picker').isPressed ? null === (e = ui.tool) || void 0 === e || e.cancel() : ui.activateTool({
                id: 'select-peep',
                cursor: 'cross_hair',
                onDown: function(e) {
                    var t, n, A, c, C, r = e.entityId;
                    if (void 0 !== r) {
                        var a = map.getEntity(r);
                        if (!a || 'car' === a.type) return void ui.showError('You need Basssiiie\'s', 'Ride Vehicle Editor');
                        if (!a || 'guest' !== a.type && 'staff' !== a.type) return o('Invalid entity type selected: '.concat(a.type)), 
                        void ui.showError('You must select a guest', 'or staff member');
                        !(function(e) {
                            O = (S = j = e).costume, T = B.indexOf(S.staffType);
                        })(a), c = j, C = ui.getWindow(i).findWidget('button-freeze'), c.energy <= 1 ? C.isPressed = !0 : C.isPressed = !1, 
                        A = j, h(), I = context.subscribe('interval.tick', (function() {
                            ui.getWindow(i).findWidget('viewport-peep').viewport.moveTo(A);
                        })), ve(), ye('button-picker'), ui.getWindow(i).widgets.filter((function(e) {
                            return 'button' === e.type;
                        })).slice(2, 6).forEach((function(e) {
                            e.isDisabled = !1;
                        })), 'guest' === a.type ? (be('button-freeze'), de('Guest properties'), n = j, pe.findWidget('colourpicker-tshirt').colour = n.tshirtColour, 
                        pe.findWidget('colourpicker-trousers').colour = n.trousersColour, pe.findWidget('colourpicker-balloon').colour = n.balloonColour, 
                        pe.findWidget('colourpicker-hat').colour = n.hatColour, pe.findWidget('colourpicker-umbrella').colour = n.umbrellaColour) : (de('Staff member properties'), 
                        (function(e) {
                            pe.findWidget('colourpicker-staff').colour = e.colour;
                        })(j), (function(e) {
                            le();
                            var t, n = pe.findWidget('textbox-staff-colour');
                            t = context.subscribe('interval.tick', (function() {
                                n.text = ''.concat(g[e.colour]);
                            })), he = t;
                        })(j), (function(e) {
                            var t = pe.findWidget('dropdown-costume');
                            'entertainer' === e.staffType && (t.selectedIndex = O, e.costume > 251 ? t.text = N[e.costume - 208] : t.text = N[e.costume]), 
                            'mechanic' === e.staffType && (t.selectedIndex = N.Mechanic), 'handyman' === e.staffType && (t.selectedIndex = N.Handyman), 
                            'security' === e.staffType && (t.selectedIndex = N['Security guard']);
                        })(j), (function(e) {
                            var t = pe.findWidget('dropdown-staff-type');
                            t.text = d[e.staffType], t.selectedIndex = T;
                        })(j), (function(e) {
                            var t;
                            ue(), t = context.subscribe('interval.tick', (function() {
                                pe.findWidget('spinner-x-position').text = e.x.toString(), pe.findWidget('spinner-y-position').text = e.y.toString(), 
                                pe.findWidget('spinner-z-position').text = e.z.toString();
                            })), Ie = t;
                        })(j), ke(j)), null === (t = ui.tool) || void 0 === t || t.cancel();
                    }
                }
            }), void ye('button-picker');
            var e;
        }
    }, Ne = {
        type: 'button',
        name: 'button-freeze',
        x: Se.x,
        y: Se.y + Se.height,
        height: C,
        width: C,
        image: 5182,
        border: !1,
        isDisabled: !0,
        tooltip: '(Un)freeze staff member',
        onClick: function() {
            var e;
            0 !== j.energy ? ((e = ui.getWindow(i).widgets.filter((function(e) {
                return 'button-freeze' === e.name;
            }))[0]).isPressed = !0, o(''.concat(e.name, ' is pressed'))) : (function(e) {
                var t = ui.getWindow(i).widgets.filter((function(e) {
                    return 'button-freeze' === e.name;
                }))[0];
                t.isPressed = !1, o(''.concat(t.name, ' is unpressed'));
            })(), ke(j), context.executeAction('pe_freezestaff', {
                peepId: j.id
            });
        }
    }, Be = {
        type: 'button',
        name: 'button-peep-name',
        x: Se.x,
        y: Ne.y + Ne.height,
        height: C,
        width: C,
        image: 5168,
        border: !1,
        isDisabled: !0,
        tooltip: 'Rename peep with longer name',
        onClick: function() {
            var e, t = ui.getWindow(i);
            ui.showTextInput({
                title: (e = j, 'staff' === e.peepType ? 'Staff member name' : 'Guest\'s name'),
                description: Ge(j),
                initialValue: ''.concat(j.name),
                callback: function(e) {
                    context.executeAction('pe_peepname', (function(e, t) {
                        return {
                            peepId: e.id,
                            text: t
                        };
                    })(j, e)), t.findWidget('label-peep-name').text = '{WHITE}'.concat(e);
                }
            });
        }
    }, Ee = {
        type: 'button',
        name: 'button-locate',
        x: Se.x,
        y: Be.y + Be.height,
        height: C,
        width: C,
        image: 5167,
        border: !1,
        isDisabled: !0,
        tooltip: 'Go to selected peep',
        onClick: function() {
            return ui.mainViewport.scrollTo(j);
        }
    }, Te = {
        type: 'button',
        name: 'button-delete',
        x: Se.x,
        y: Ee.y + Ee.height,
        height: C,
        width: C,
        image: 5165,
        border: !1,
        isDisabled: !0,
        tooltip: 'Remove selected peep(s)',
        onClick: function() {
            return t = j, void ((n = ui.getWindow(ze)) ? (o('Remove peep window is already shown'), 
            n.bringToFront()) : ui.openWindow({
                onClose: function() {
                    var e;
                    null === (e = ui.tool) || void 0 === e || e.cancel();
                },
                classification: ze,
                title: 'Remove peep',
                width: 200,
                height: 100,
                x: ui.width / 2 - 100,
                y: ui.height / 2 - 50,
                colours: [ e['Bordeaux red'], e['Bordeaux red'] ],
                widgets: [ {
                    type: 'label',
                    x: 0,
                    y: 48,
                    width: 200,
                    height: c,
                    textAlign: 'centred',
                    text: De(t),
                    isDisabled: !1
                }, {
                    name: 'yes',
                    type: 'button',
                    border: !0,
                    x: 10,
                    y: 80,
                    width: 85,
                    height: 14,
                    text: 'Yes',
                    isPressed: !1,
                    isDisabled: !1,
                    onClick: function() {
                        ui.getWindow(ze).close(), pe.close(), ui.getWindow(i).findWidget('label-peep-name').text = '{RED} No peep selected', 
                        u(), ve(), we(), me(), context.executeAction('pe_removepeep', (function(e) {
                            return {
                                peepId: e.id
                            };
                        })(t));
                    }
                }, {
                    name: 'cancel',
                    type: 'button',
                    border: !0,
                    x: 105,
                    y: 80,
                    width: 85,
                    height: 14,
                    text: 'Cancel',
                    isPressed: !1,
                    isDisabled: !1,
                    onClick: function() {
                        return ui.getWindow(ze).close();
                    }
                } ]
            }));
            var t, n;
        }
    }, Oe = {
        type: 'button',
        name: 'button-all-guests',
        x: Se.x,
        y: Te.y + Te.height,
        height: C,
        width: C,
        image: 5193,
        border: !1,
        isDisabled: !1,
        tooltip: 'Select all guests',
        onClick: function() {
            return (t = ui.getWindow(i)).findWidget('button-picker').isPressed && ye('button-picker'), 
            t.findWidget('button-all-guests').isPressed ? (be('button-delete'), t.findWidget('label-peep-name').text = '{RED} No peep selected', 
            pe.close()) : (me(), we(), u(), null === (e = ui.tool) || void 0 === e || e.cancel(), 
            ui.getWindow(i).widgets.filter((function(e) {
                return 'button-delete' === e.name;
            }))[0].isDisabled = !1, t.findWidget('label-peep-name').text = '{GREEN}All guests selected', 
            de('All guests properties')), void ye('button-all-guests');
            var e, t;
        }
    }, Le = {
        type: 'label',
        name: 'label-author',
        x: 5,
        y: je.height + je.y + 2.5,
        height: c,
        width: 250,
        isDisabled: !0,
        text: 'Manticore-007 © 2022-2023',
        textAlign: 'centred'
    }, Ze = {
        type: 'button',
        name: 'button-about',
        x: 6,
        y: Le.y,
        height: 10,
        width: 10,
        image: 5129,
        border: !1,
        isDisabled: !1,
        onClick: function() {
            return de('About');
        }
    }, He = (function() {
        function e() {}
        return e.prototype.open = function() {
            var e = ui.getWindow(i), t = Ze.y + c;
            e ? (o('The Peep Editor window is already shown.'), e.bringToFront()) : (ui.openWindow({
                classification: i,
                title: 'Peep Editor',
                x: ui.width / 8 - 32.5,
                y: ui.height / 8 - t / 8,
                width: 260,
                height: t,
                colours: [ A, A ],
                widgets: [ Pe, Me, je, Se, Ne, Be, Ee, Te, Oe, Le, Ze ],
                onClose: function() {
                    var e;
                    pe && pe.close(), h(), null === (e = ui.tool) || void 0 === e || e.cancel();
                },
                onUpdate: function() {
                    var e = ui.getWindow(i);
                    pe && (pe.x = e.x + e.width, pe.y = e.y);
                }
            }), u());
        }, e;
    })();
    function Ge(e) {
        return 'staff' === e.peepType ? 'Enter new name for this member of staff:' : 'Enter name for this guest:';
    }
    function We(e) {
        return (function(e, t) {
            if ('none' !== network.mode) {
                var n = network.getPlayer(e).group, g = null === (A = (function(e, t) {
                    for (var o = 0; o < e.length; o++) if (e[o].id === n) return o;
                    return null;
                })(i = network.groups)) ? null : i[A];
                if (!g) return o('Cannot apply update from player', e, ': group id', n, 'not found.'), 
                !1;
                if (g.permissions.indexOf(t) < 0) return o('Cannot apply update from player', e, ': lacking', t, 'permission.'), 
                !1;
            }
            var i, A;
            return !0;
        })(e.player, 'staff') ? {} : {
            error: 2,
            errorTitle: 'Missing permissions!',
            errorMessage: 'Permission \'Guest\' and \'Staff\' is required to use the Peep Editor on this server.'
        };
    }
    var Ue = new He;
    registerPlugin({
        name: 'Peep Editor',
        version: t,
        authors: [ 'Manticore-007' ],
        type: 'remote',
        licence: 'MIT',
        targetApiVersion: 77,
        main: function() {
            var e, t;
            o('Plugin started.'), n && (context.registerAction('pe_setflag', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.guestId || (t = map.getEntity(e.guestId), n = e.key, o = e.value, 
                    t.setFlag(n, o)), {};
                    var t, n, o;
                })(e.args);
            })), context.registerAction('pe_setguestcolour', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.guestId ? {} : (function(e, t, n) {
                        return e[t] = n, {};
                    })(map.getEntity(e.guestId), e.property, e.colour);
                })(e.args);
            })), context.registerAction('pe_peepname', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.peepId || (t = map.getEntity(e.peepId), n = e.text, t.name = n), 
                    {};
                    var t, n;
                })(e.args);
            })), context.registerAction('pe_freezestaff', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.peepId || (0 !== (t = map.getEntity(e.peepId)).energy ? t.energy = 0 : t.energy = 90), 
                    {};
                    var t;
                })(e.args);
            })), context.registerAction('pe_removepeep', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.peepId || (map.getEntity(e.peepId).remove(), o('Peep removed')), 
                    {};
                })(e.args);
            })), context.registerAction('pe_changestaffcoordinates', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.staffId || (t = map.getEntity(e.staffId), n = e.axis, o = e.operator, 
                    g = e.multiplier, t[n] += o * g), {};
                    var t, n, o, g;
                })(e.args);
            })), context.registerAction('pe_setstaffcoordinates', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.staffId || (t = map.getEntity(e.staffId), n = e.axis, o = e.text, 
                    t[n] = parseInt(o) || t[n]), {};
                    var t, n, o;
                })(e.args);
            })), context.registerAction('pe_changestaffenergy', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.staffId || (t = map.getEntity(e.staffId), n = e.operator, 0 === t.energy || (t.energy >= 2 && -1 === n || t.energy <= 254 && 1 === n || 0 === t.energy) && (t.energy += n * a)), 
                    {};
                    var t, n;
                })(e.args);
            })), context.registerAction('pe_setstaffenergy', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.staffId || (t = map.getEntity(e.staffId), (n = e.speed) > 0 && n < 256 && (t.energy = n || t.energy)), 
                    {};
                    var t, n;
                })(e.args);
            })), context.registerAction('pe_changestaffcolour', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.staffId ? {} : (function(e, t) {
                        return e.colour = t, {};
                    })(map.getEntity(e.staffId), e.colour);
                })(e.args);
            })), context.registerAction('pe_changestafftype', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.staffId || (t = map.getEntity(e.staffId), n = e.staffType, t.staffType = B[n]), 
                    {};
                    var t, n;
                })(e.args);
            })), context.registerAction('pe_changestaffcostume', (function(e) {
                return We(e);
            }), (function(e) {
                return (function(e) {
                    return null === e.staffId ? {} : (function(e, t) {
                        return t > 43 ? (t += 208, e.costume = t) : e.costume = t, {};
                    })(map.getEntity(e.staffId), e.costume);
                })(e.args);
            })), e = [ {
                width: 16,
                height: 16,
                data: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAGL3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjapVjZkSwrDv3HijEBSSzCHNaI58GYP4cEspauinv7TWZUsgkh6Wih2/T//jPMf/CwBDbORw0pBIvHJZc4o6N2Pfn6knXXdw/s6bzMm3uBMSVoZQ01bPozT/aFE2X0/BMjrXuhvC4kt/nrGyNejUyJZr9tRmkzEl4LtBnkpZYNSeOzCqWvth1NdP3M/Dh9FfvHOMJ6zeMcYe5CYvEV4SWAzB8byVhgfFniJATBnAnXzJEEBvlkp/tJkGhMUd1HohdU7h59njfvaDneJPJm5HC3H+cN+bcFuc/h55Od7h6/zvdi45LozfrzN0bTcekMLbILMHXYSh1Vrh7oCo6YR6uBaAE8A3xI0c434VV4dYUrNFttwVspEQOuQY4aZRrUr7ZShYiOu2FgxcyV5ZpUYJe4AlISN18aHCVJEwWK9YLdCd+y0HVsstVcpylObgRSJjCb7vDr1/x2wxgzFIis3raCXMzT2BBjIje/IAMiNLZR/WXg874/E1cBgn5aeYZIgmHLYlE8PTKBXEALCD3aFYMU22YAE+FoD2FIgABQI/EUyEbmSARDKgDKEB0RwgUIkPfcICQ7QQKLrDyPxpZIFyl7xrTBPJIZkPCIrwhskmSA5ZyH/0Sn8KHsxTvvffDRq08+Bwku+BBCDDMp5ijRmehjiDFqTDGrqFOvQaOqJs2JkyBp+hRSTJpSyhlnZnDO2J1BkHPhIsUVb0oosWhJJVe4T3XV11Bj1ZpqbtykIX+00GLTllru1OFK3XXfQ49de+p5wNWGmOGGH2HEoSONfKO2Yf3x/gI12qjxhdQkjDdqmI3xsKCZTvzEDIChihAQjxMCODRPzKySczyRm5jZNHOdZwjpJ2aNJmJA0HViP+hgZ3ghOpH7v3Az0b3gxv8WOTOh+yVyP3H7hFqbZaheiK0onEa1gujDetfMmmexe217CubqDmQs70axYQ21I9AhziQsdUjRs6XaNZlrlroZjRIkGdtDXkNXByt/OfOPrXkI91U2Tp6cJ98jIfTdHNi7Da5dXVObfhX3N9Kaz6b7O+mONBCmI2gXVRapBYRrlBDSQP+SNKUC5700iT65o1NUu3gOuAoTVNtHpNT9WkJUfWkJXrWoA/WcRrBrOKia4DxvmLuglj2kgPRLjIaa5Oq7ld9a820BotM+zmvsCOtvdK02dOcdElQxW5TBJUDqSBVHl9yuSZRPmHBDmEl6e4fI3BNNloZWVOt26ogs+m0edlmDrm6oGpnhPMcNsOXlUbhH7FZ63XwGIrx1MNvU/uFXvSEGzZSVNUntG3mUgJ5uorL1ldS+WtPL5ZDwaNsj9+UFtUdH/Zir2TSQP2dWm8Mc4sOPbmO7coUIjKsx559YqKzdNSKTdi5rhGtVy0i6l8BdUY79gsAMKDWOSTgtxNvEMC71eny4V2kwuW3hkV/qSK2vWBvFyRB5N/O3VpBjF5sqzQMMWkMDIKoO2qtQCC7yycLI6ltVZMp1TVh2y6hgbdoIioTY4Lj96J3qM6eoG4fhOKL2HVd9C1Lzd9GJxL6YAcXGuGYeVGn4FYXmGalX6e/p121+e+ib06DS9tLuIMN18siEu8HJNzwr4B98yWwe05cigmBt5YAUBoXO1sb07Ax5S+4IouS1yWAXBKm3IJWPaeF68Yftej5+Conpzi2+mQ07ASvUyJ0oCq6Df4jmV3dqYk6en0y4HduF7neSSLXPS/yiYpRjkbgdxbHDvp1LUEVGDj/Oa9R3FYjSUSxWUCTS2wRxS+AczNYpbdUwljq+hkUbp7qIgJTzCUn8CbMNgL9pWx0ubgE9XCjd++/kWiavE+dXmAsfiWzHojuXCMXqnREcHOdR+h5qwatlQ5pzQpA+Q2pesO3b62pLI/7IUXIkcsPeKTTsUDJIWl2/ewvc/WcgPpWWzjs5meG91PjvstHzqvmMkhz0UURqr3wuFbaN7V42PZl02WgGXXU7cDtCTvsfyvOn1nwuw648B3PY4asdsdx0JzSPml62qRG0d9oJZdlSKwpn2gA1Pyvq39z/zN9cEF9vXr1tAyKJ4Bq1r3umwmvDzjXePgfksyfi2jz///E/dl1z7P6YbD0AAAGEaUNDUElDQyBwcm9maWxlAAB4nH2RPUjDQBzFX1OlIpUOZhDtkKE6WRAVcZQqFsFCaSu06mBy/YQmDUmKi6PgWnDwY7Hq4OKsq4OrIAh+gDg6OSm6SIn/SwotYjw47se7e4+7d4DQrDLV7JkAVM0yUvGYlM2tSoFXBDECESGEZWbqifRiBp7j6x4+vt5FeZb3uT/HQL5gMsAnEc8x3bCIN4hnNi2d8z6xyMpynviceNygCxI/cl1x+Y1zyWGBZ4pGJjVPLBJLpS5WupiVDZV4mjiSVzXKF7Iu5zlvcVardda+J39hsKCtpLlOM4w4lpBAEhIU1FFBFRaitGqkmEjRfszDP+z4k+RSyFUBI8cCalAhO37wP/jdrVmcmnSTgjGg98W2P0aBwC7Qatj297Ftt04A/zNwpXX8tSYw+0l6o6NFjoDQNnBx3dGUPeByBxh60mVDdiQ/TaFYBN7P6JtywOAt0L/m9tbex+kDkKGulm+Ag0NgrETZ6x7v7uvu7d8z7f5+AI58crL4ksomAAANdmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo4ZGM5MWE3OS1kOWI4LTRmYWItOGZkYy1jM2U5ODBhODhmYzIiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NWY0MTgzMDgtYzczYi00NTZiLWE4ZTAtNTUyMDE5NDJlNzM2IgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YTFjMzQxZmEtOTEzMi00ZjRlLWE3MzAtMzc0NDMwYzIwYzY1IgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2NzIxNzkzODQ1Njg2MDIiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zMiIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjI6MTI6MjdUMjM6MTY6MjQrMDE6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIyOjEyOjI3VDIzOjE2OjI0KzAxOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NmE0ZmRmMjYtYzJiMy00ZWU4LTg1ZTMtMjAyYTJhOGUwNDgzIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIyLTEyLTI3VDIzOjE2OjI0Ii8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pv1RSnIAAAMAUExURQAAAAEBAQICAgMDAwQEBAUFBQYGBgcHBwgICAkJCRcjIyMzMy9DQz9TU0tjY1tzc2+Dg4OXl5+vr7fDw9Pb2+/z8zMvAD87AE9LC1tbE2trH3d7L4eLO5ebT6evX7u/c8vPi9/jo0MrB1c7C29LF39XH49jJ59zM7ODQ7+XV8uvb9vHh+fbo/fvw0cbAF8rAHc/AI9TB6dvB7+LD9enE/PLG//nL//zX//7j///wyMAAE8AAF8HB28PD38bG48nJ6M7O7NPT8dnZ9d/f+ufn/+/vxszEyM/Fy9PHztfJ0dvK1d/M2OPO3ObQ4OrS5O7U6PLX7fbZx83Gy9HIztTK0tjN1tvQ2+HT4efX5+3b7fPf8Pbk8/np9/3vw8/ABNTABdnAB97ACePBzefF0evJ1u/P2/PV4vfc6Pvj8P/s08rE2M3G3dHK4tXO6djQ7tzU8+DY9eXc+Org++/l/fPq//jww8TNycrVzM3Zz9Dd1NTi2Njm3d3r4uLv5+fz7e339PT7+/v/wAbbwAnlwczpw9DuxtTyytn30OH41uj53e774/T86/n+9f3/wsrDw83FxdHHyNTKy9jOztzS0+HX2Obd3uvi5PHp6/bw8/z3z8AX0sHc1MPf18fj2srm3s/q4dTu5tnx6t/17+b59fD8/Pr/z8AAFcAAHMAAI8AAKsAAMcAAOMHAP8HAP9PQ/97c/+ro//b108nAG8zAJM/ALdHANtPAP9TAP9vF/+LM/+jT/+3a//Lh//bowAzLwA/NwBLQwBXTwdrYxd/dyuTj0eno2O7u4PPz6vn58///z8AG2cAM3sLP48XT6MfX7cnb9s7j+9bq/N3u/eXy/u33//X7ycTADcfB0cvD1s/H2tTM3tnS49/a6OTf7urk8/Dq+fbw//z3zdLS/+3AP/bAP//AAdrYwdrYyePhxuDewdrYzeblzebl5vj43PLyzebl0NbW1Nra2N7e28zL4M3L5c/M6tDM79LL9NPK+dXI/9fH/9/J/+bM/+3P//PS////4+DsWcAAAABdFJOUwBA5thmAAAAAWJLR0QAiAUdSAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+YMGxYQGA8kOmUAAAA+SURBVBjTnY1BCgAwCMP8/4vb7jKFspUdF0E0Fqz6g+YINasrEqMYArMihHrOhF5B0dZgjvmW6BnCTQBuX2zD80I74yzB2wAAAABJRU5ErkJggg=='
            } ], (t = ui.imageManager.allocate(e.length)) && e.forEach((function(e, n) {
                ui.imageManager.setPixelData(t.start + n, {
                    type: 'png',
                    palette: 'keep',
                    data: e.data
                }), m[n] = t.start + n;
            })), ui.registerMenuItem('Peep Editor', (function() {
                return Ue.open();
            })));
        }
    });
})();
