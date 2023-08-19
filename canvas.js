export default class Canvas {
	constructor(options) {
		this.w = options.w;
		this.h = options.h;
		this.canvas = document.createElement("canvas");
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		this.context = this.canvas.getContext("2d");
	}

	clear() {
		this.canvas.width = this.w;
	}

	drawBlock(where, x, y, w, h, colour) {
		where.fillStyle = colour;
		where.fillRect(x, y, w, h);
	}

	drawText(where, x, y, msg) {
		where.fillText(msg, x, y);
	}

	drawCircle(where, x, y, r, fillStyle, lineWidth, strokeStyle) {
		where.beginPath();
		where.arc(x, y, r, 2 * Math.PI, false);
		where.closePath();
		where.fillStyle = fillStyle;
		where.fill();
		where.lineWidth = lineWidth;
		where.strokeStyle = strokeStyle;
		where.stroke();
	}
}
