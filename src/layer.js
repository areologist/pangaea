/**
 * pangaea layer class
 *
 */
var pan = pan || {};

(function() {
	'use strict';

	/**
	 * @desc 
	 * @constructor 
	 * @memberof pan
	 */
	pan.Layer = function (data, name, type, left, top, width, height) {

		var map = pan.canvas.map;

		this.data = data || [];
		this.name = name;
		this.type = type;
		this.left = left || 0;
		this.top = top || 0;
		this.width = width || map.width;
		this.height = height || map.height;
		this.coords = [];
	};


	/**
	 * @desc Updates dynamic layer state.
	 */
	pan.Layer.prototype.update = function () {
		//
	};

	/**
	 * @desc Draws tiles to the canvas.
	 * @method
	 */
	pan.Layer.prototype.render = function () {
		//
	};

	/**
	 * @desc Precomputes tile mappings for fast rendering.
	 */
	pan.Layer.prototype.prerender = function () {
		var map = pan.canvas.map,
			i, x, y,
			tileIndex, tileset,
			atlas, atlasindex,
			frame,
			length;

		if (this.type === 'tilelayer') {
			for (i = 0; i < this.data.length; i++) {
				// get tile index at position i
				tileIndex = this.data[i];

				if (tileIndex === 0) {
					continue;
				}

				// get tileset
				for (x = pan.canvas.tilesets.length; x >= 0;x) {
					x--;
					if (pan.canvas.tilesets[x].firstgid <= tileIndex) {
						tileset = pan.canvas.tilesets[x];
						x = -1;
					}
				}

				// lookup atlas
				for (y = 0; y < pan.canvas.atlases.length; y++) {
					atlas = pan.canvas.atlases[y];
					atlasindex = y;

					// lookup frame by name
					frame = this.selectFrame(atlas, tileset.image);
					if (frame) {
						break;
					}
				}

				// calculate tile source and destination coords
				this.computeFrame(map, frame, i, tileset, tileIndex);

				if (!pan.canvas.table) {
					length = Math.ceil((this.width / map.tilewidth) * (this.height / map.tileheight));
					pan.canvas.table = [length];
				}

				// cache precalculated atlas index and source coordinates
				pan.canvas.table[tileIndex] = {
					aindex: 0,
					srcx: frame.srcx,
					srcy: frame.srcy,
					w: tileset.tilewidth,
					h: tileset.tileheight
				};
			}
		}
	};

	/**
	 * @desc Precomputes tile mappings for single tile data point.
	 */
	pan.Layer.prototype.computeFrame = function (map, frame, index, tileset, tileIndex) {
		var xpos,
			ypos,
			localindex,
			localwidth;

		frame.srcx = 0;
		frame.srcy = 0;

		// calculate source x and source y
		localindex = tileIndex - tileset.firstgid;
		localwidth = frame.frame.w / map.tilewidth;

		frame.srcx = Math.round(((localindex / localwidth) % 1) * localwidth) * map.tilewidth;
		frame.srcx = frame.srcx + frame.frame.x;

		frame.srcy = Math.floor(localindex / localwidth) * map.tileheight;
		frame.srcy = frame.srcy + frame.frame.y;

		// calculate base destination xy coords
		xpos = Math.round(((index / map.width) % 1) * map.width * map.tilewidth);
		ypos = Math.floor(index / map.width) * map.tileheight;
		this.coords[index] = {
			xpos: xpos,
			ypos: ypos
		};
	};

	/**
	 * @desc Searches atlas frames by key and returns first match.
	 */
	pan.Layer.prototype.selectFrame = function (atlas, key) {
		var z;
		for (z = 0; z < atlas.frames.length; z++) {
			if (atlas.frames[z].filename === key) {
				return atlas.frames[z];
			}
		}
		return null;
	};
}());