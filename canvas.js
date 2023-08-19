export default class Canvas {
	num(min, max) {
		return Math.random() * (max - min) + min;
	}
	int(min, max) {
		return parseInt(this.num(min, max));
	}

	constructor(options) {
		if (options.scale == null) {
			options.scale = 1;
		}

		this.scale = options.scale;
		this.w = options.w * this.scale;
		this.h = options.h * this.scale;

		this.canvas = document.createElement("canvas");
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		this.context = this.canvas.getContext("2d");
	}

	clear() {
		this.canvas.width = this.canvas.width;
	}

	drawBlock(where, x, y, w, h, colour) {
		where.fillStyle = colour;
		where.fillRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale);
	}

	drawText(where, x, y, msg) {
		where.fillText(msg, x, y);
	}

	drawCircle(where, x, y, r, fillStyle, lineWidth, strokeStyle) {
		// console.log("drawCircle",  fillStyle, lineWidth, strokeStyle)
		where.beginPath();
		where.arc(x * this.scale, y * this.scale, r * this.scale, 2 * Math.PI, false);
		where.closePath();
		where.fillStyle = fillStyle;
		where.fill();
		where.lineWidth = lineWidth * this.scale;
		where.strokeStyle = strokeStyle;
		where.stroke();
	}
}
