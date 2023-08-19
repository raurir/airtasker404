import Canvas from "./canvas";

export default class HUD extends Canvas {
	constructor(options) {
		super(options);
		this.alert = 0;
		this.x = 150 * this.scale;
		this.y = 330 * this.scale;
	}

	round(num) {
		return Math.round(num * 10) / 10;
	}

	stat(index, txt, num) {
		this.context.font = "normal 8px sans-serif";
		this.context.fillStyle = "white";
		const y = this.y + 10 + index * 14;
		this.drawText(this.context, this.x, y, txt);
		if (num != null) {
			this.drawText(this.context, this.x + 30, y, num);
		}
	}

	render(doRender, ship, level, msg) {
		this.canvas.width = this.canvas.width; // clear HUD

		// @context.scale(@scale,@scale)

		const black = "rgba(0,0,0,1)";
		const whiteMid = "rgba(255,255,255,0.5)";
		const whiteBright = "rgba(255,255,255,0.9)";

		if (doRender) {
			let colourBG, colourFuel;
			if (ship.fuel < level.fuel / 4) {
				this.alert += 8;
				this.alert %= 255;
				colourBG = `rgba(${this.alert},0,0,0.5)`;
				colourFuel = "rgba(255,0,0,0.5)";
			} else {
				colourBG = "rgba(0,0,0,0.5)";
				colourFuel = whiteBright;
			}

			this.drawBlock(this.context, this.x - 5, this.y - 5, 110, 65, colourBG);

			const barWidth = 40;
			const barX = this.x + 60;

			this.stat(0, "Gravity:", this.round(level.gravity * 100));
			let barY = this.y;
			this.drawBlock(this.context, barX, barY, barWidth, 10, whiteMid);
			this.drawBlock(this.context, barX + 1, barY + 1, barWidth - 2, 8, black);
			this.drawBlock(this.context, barX + 2, barY + 2, this.round(level.gravity * 600), 6, whiteBright);

			this.stat(1, "Wind:", this.round(level.wind * 100));
			barY = this.y + 15;
			this.drawBlock(this.context, barX, barY, barWidth, 10, whiteMid);
			this.drawBlock(this.context, barX + 1, barY + 1, barWidth - 2, 8, black);
			this.drawBlock(this.context, barX + barWidth / 2 - 1, barY + 1, 2, 8, whiteMid);
			this.drawBlock(this.context, barX + barWidth / 2, barY + 2, this.round(level.wind * 1000), 6, whiteBright);

			this.stat(2, "Fuel:", this.round(ship.fuel));
			barY = this.y + 30;
			this.drawBlock(this.context, barX, barY, barWidth, 10, colourFuel);
			this.drawBlock(this.context, barX + 1, barY + 1, barWidth - 2, 8, black);
			this.drawBlock(this.context, barX + 2, barY + 2, (ship.fuel / level.fuel) * (barWidth - 4), 6, colourFuel);

			level.time.passed = Math.round((new Date().getTime() - level.time.start) / 100) / 10;
			this.stat(3, "Time:", level.time.passed);
		}
		// @stat(2, "Altitude:      ", @round(@world.h - ship.y))
		// @stat(4, "Altitude:", @round(ship.heightAboveFloor || 0))

		if (msg) {
			// console.log(msg)

			let colour;
			const { title } = msg;
			const { summary } = msg;
			const { state } = msg;

			if (state != null && state === "crashed") {
				colour = "rgba(150,0,0,0.7)";
			} else {
				colour = "rgba(0,0,0,0.5)";
			}

			this.drawBlock(this.context, this.w * 0.1, this.h * 0.2, this.w * 0.8, this.h * 0.6, colour);

			this.context.fillStyle = "white";

			this.context.textAlign = "center";
			this.context.textBaseline = "middle"; // valign
			this.context.font = "bold 30px sans-serif";
			this.drawText(this.context, this.w / 2, this.h / 2 - 80, title);

			this.context.font = "normal 20px sans-serif";

			if (state != null && state === "points") {
				return (() => {
					const result = [];
					for (let i = 0; i < summary.length; i++) {
						const s = summary[i];
						if (s != null) {
							const y = this.h / 2 - 30 + i * 25;
							this.context.textAlign = "left";
							this.drawText(this.context, this.w / 2 - 150, y, s[0]);
							this.context.textAlign = "right";
							this.drawText(this.context, this.w / 2 + 50, y, s[1]);
							this.context.textAlign = "right";
							result.push(this.drawText(this.context, this.w / 2 + 150, y, s[2]));
						} else {
							result.push(undefined);
						}
					}
					return result;
				})();
			}
			const lines = summary.length;
			return (() => {
				const result = [];
				for (let i = 0; i < summary.length; i++) {
					const s = summary[i];
					result.push(this.drawText(this.context, this.w / 2, this.h / 2 + 30 + 25 * (i - lines / 2), s));
				}
				return result;
			})();
		}
	}
}
