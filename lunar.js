const utils = {
	isTouchDevice() {
		return "ontouchstart" in document.documentElement;
	},
};

import Levels from "./levels";
import Canvas from "./canvas";
import World from "./world";
import HUD from "./hud";
import Ship from "./ship";

const STARTLEVEL = "STARTLEVEL";
const PLAYING = "PLAYING";
const CRASHED = "CRASHED";
const LANDED = "LANDED";
const ENDLEVEL = "ENDLEVEL";
const GAMEOVER = "GAMEOVER";

export default class Lunar {
	// don't confuse state with ship.state

	state = PLAYING;

	msg = null;
	pressedKeys = {};

	levelIndex = 0;
	highScore = 0;

	hasFocus = false;
	hasListeners = false;
	hasLoop = false;

	miniRadius = 0;
	// game over animation...
	shoes = [];

	constructor() {
		this.el = document.createElement("div");

		// $(@el).css("opacity", 0.15)

		const scale = 1; // scale is not implemented!

		const baseWidth = 1600;
		const baseHeight = 800;

		this.levels = Levels;
		this.world = new World({ w: baseWidth, h: baseHeight, scale });
		this.stage = new Canvas({ w: baseWidth / 2, h: baseHeight / 2, scale });
		this.offscreen = new Canvas({ w: baseWidth, h: baseHeight, scale });
		this.hud = new HUD({ w: this.stage.w, h: this.stage.h, scale });
		this.ship = new Ship({ w: 100, h: 50, scale });

		this.el.appendChild(this.stage.canvas);
		this.stage.canvas.style.border = "5px solid rgba(0,0,0,0)";

		if (utils.isTouchDevice()) {
			const createArrow = (dir, code) => {
				const div = document.createElement("div");
				this.el.appendChild(div);
				div.className = `game-${dir}-arrow at-icon-chevron-${dir}`;
				div.innerText = code;
				return div;
			};
			const left = createArrow("left", 37);
			const right = createArrow("right", 39);
			const up = createArrow("up", 38);
			const down = createArrow("down", 40);
		}

		const interactionListener = (e) => {
			if (this.state === GAMEOVER) {
				return;
			}
			this.hasFocus = e.target === this.stage.canvas;
			if (this.hasFocus) {
				return this.addListeners();
			}
			return this.removeListeners();
		};

		document.addEventListener("touchstart", interactionListener);
		document.addEventListener("click", interactionListener);

		this.attempts = 1;
		this.pointsTotal = [];

		const img = new Image();
		img.onload = () => {
			this.ship.loaded(img);
			return this.restartLevel();
		};
		// @loop()
		img.src = "/images/lunar-shoe.png";
	}

	addListeners() {
		if (this.hasListeners) {
			return;
		}
		this.stage.canvas.style.border = "5px solid rgba(10,140,255,0.5)";
		if (utils.isTouchDevice()) {
			this.game = document.getElementById("game");

			this.onTouchStart = (ev) => {
				const e = ev.originalEvent;
				e.preventDefault();
				this.interactStart(String(e.target.code));
			};
			this.onTouchEnd = (ev) => {
				const e = ev.originalEvent;
				e.preventDefault();
				this.interactEnd(String(e.target.code));
			};

			this.game.addEventListener("touchstart", this.onTouchStart);
			this.game.addEventListener("touchend", this.onTouchEnd);
		} else {
			this.onKeyDown = (event) => {
				event.preventDefault();
				this.interactStart(event.code);
			};
			this.onKeyUp = (event) => this.interactEnd(event.code);
			document.body.addEventListener("keydown", this.onKeyDown);
			document.body.addEventListener("keyup", this.onKeyUp);
		}
		this.hasListeners = true;
	}

	removeListeners() {
		if (this.hasListeners === false) {
			return;
		}
		this.stage.canvas.style.border = "5px solid rgba(0,0,0,0)";
		if (utils.isTouchDevice()) {
			this.game.removeEventListener("touchstart", this.onTouchStart);
			this.game.removeEventListener("touchend", this.onTouchEnd);
		} else {
			document.body.removeEventListener("keydown", this.onKeyDown);
			document.body.removeEventListener("keyup", this.onKeyUp);
		}
		this.hasListeners = false;
	}

	interactStart(code) {
		if (code == null) {
			return;
		}
		if (this.hasLoop === false) {
			this.hasLoop = true;
			this.loop();
		}
		if (this.state === STARTLEVEL) {
			this.startPlaying();
		}
		// @gameOver()
		this.pressedKeys[code] = true;
	}

	interactEnd(code) {
		if (code == null) {
			return;
		}
		this.pressedKeys[code] = false;
	}

	startPlaying() {
		console.log("startPlaying");
		this.state = PLAYING;
	}

	crashed() {
		this.state = CRASHED;
		this.attempts++;
		console.log("crashed attempts", this.attempts);
		return setTimeout(() => this.restartLevel(), 1000);
	}

	restartLevel() {
		console.log("restartLevel");

		this.state = STARTLEVEL;

		this.level = this.levels[this.levelIndex];
		this.level.time = { start: new Date().getTime() };
		this.world.createLand(this.level);
		this.ship.createShip(this.level);
		this.ship.x = this.world.w * 0.5;
		this.ship.y = 100;

		return this.render({
			title: `Level ${this.levelIndex + 1}`,
			summary: this.level.title.concat("", "Touch/Press keys to start..."),
		});
	}

	endLevel() {
		// console.log("endLevel", @levelIndex)
		this.state = ENDLEVEL;
		this.pointsHeader = `Level ${this.levelIndex + 1} Complete`;
		this.pointsSummary = [];
		this.pointsLevel = 0;
		return setTimeout(() => this.showPoints(0), 1500);
	}

	showPoints(pointsIndex) {
		console.log("showPoints", pointsIndex);
		switch (pointsIndex) {
			case 0:
				var pointsStat = Math.round(20000 / this.attempts);
				this.pointsLevel = pointsStat;
				this.pointsSummary[pointsIndex] = ["Attempts:", this.attempts, pointsStat];
				break;
			case 1:
				pointsStat = Math.round(50 / this.level.time.passed) * 1500;
				this.pointsLevel += pointsStat;
				this.pointsSummary[pointsIndex] = ["Time:", this.level.time.passed, pointsStat];
				break;
			case 2:
				pointsStat = Math.round(5 * this.ship.fuel);
				this.pointsLevel += pointsStat;
				this.pointsSummary[pointsIndex] = ["Fuel:", this.ship.fuel, pointsStat];
				break;
			case 3:
				pointsStat = this.level.difficulty * 10;
				this.pointsLevel *= pointsStat;
				this.pointsSummary[pointsIndex] = ["Level Bonus:", "", `x${pointsStat}`];
				break;
		}

		this.pointsSummary[4] = ["Level Score:", "", this.pointsLevel];

		this.pointsTotal[this.levelIndex] = this.pointsLevel;

		const total = this.pointsTotal.reduce((sum, el) => sum + el, 0);

		this.highScore = total;

		this.pointsSummary[5] = ["Game Score:", "", total];

		this.render({
			title: this.pointsHeader,
			summary: this.pointsSummary,
			state: "points",
		});

		pointsIndex++;
		if (pointsIndex < 4) {
			return setTimeout(() => this.showPoints(pointsIndex), 700);
		}
		return this.nextLevel();
	}

	nextLevel() {
		this.levelIndex++;
		this.attempts = 1;
		this.level.time = { start: new Date().getTime() };

		console.log("nextLevel", this.levelIndex);

		this.saveScore();

		if (this.levelIndex === this.levels.length) {
			return setTimeout(() => this.gameOver(), 2000);
		}
		return setTimeout(() => this.restartLevel(), 2000);
	}

	gameOver() {
		this.state = GAMEOVER;
		this.render({
			title: "Game over",
			summary: [
				"Congratulations! You did it!",
				`You're score: ${this.highScore}`,
				"Why are shoes flying everywhere you might ask?",
				"We're not sure...",
				"Go and post a real task on Airtasker!",
			],
		});

		// const makeShare = (network, title) =>
		// 	$(`<div class='share-game-button ${network}'>`)
		// 		.text(title)
		// 		.appendTo("#game")
		// 		.on("touchstart, click", (e) => this.share(network));
		// makeShare("facebook", "Share on Facebook");
		// return makeShare("twitter", "Tweet your score");
	}

	share(network) {
		const msg = `I just got ${this.highScore} on the Airtasker 404 Game!`;
		const link = (() => {
			switch (network) {
				case "facebook":
					return "https://www.facebook.com/sharer/sharer.php?u=http://www.airtasker.com/beatthat";
				case "twitter":
					return `https://twitter.com/intent/tweet?url=http://www.airtasker.com/beatthat&text=${msg}&hashtags=airtasker,404`;
			}
		})();
		return window.open(link);
	}
	// alert(msg)

	saveScore() {
		if ((typeof Airtasker !== "undefined" && Airtasker !== null ? Airtasker.currentUser : undefined) != null) {
			const currentHighScore = Airtasker.currentUser.get("web_display_options").lunar_highscore;
			if (currentHighScore != null && currentHighScore > this.highScore) {
				// shucks...
				return console.log("no high score this time!!!", currentHighScore, this.highScore);
			}
			console.log("Actually saving high score!");
			// return service.setDisplayOptions(
			//   { lunar_highscore: this.highScore },
			//   (response) => console.log("score saved", response),
			//   (response) => console.log("couldn't save score")
			// );
		}
		return console.log("no onelogged in");
	}

	loop() {
		requestAnimationFrame(() => this.loop());
		if (this.hasFocus) {
			if (this.state === PLAYING) {
				this.updateShip();
			}
			this.render();
			if (this.state === GAMEOVER) {
				return this.explodeShoes();
			}
		} else {
			this.stage.context.clearRect(0, 0, this.stage.w, this.stage.h);
			return this.renderHUD(false, {
				title: "Game Paused ...ish",
				summary: ["Press to start"],
			});
		}
	}

	updateShip() {
		this.ship.update(
			this.world,
			this.isKeyDown("KeyA") || this.isKeyDown("ArrowLeft"),
			this.isKeyDown("KeyD") || this.isKeyDown("ArrowRight"),
			this.isKeyDown("KeyW") || this.isKeyDown("ArrowUp"),
			this.isKeyDown("KeyS") || this.isKeyDown("ArrowDown")
		);

		switch (this.ship.state) {
			case this.ship.FLYING:
				return (this.msg = null);
			case this.ship.LANDED:
				if (this.ship.platform != null) {
					if (this.ship.platform.dropoff != null || this.ship.platform.pickup != null) {
						if (this.ship.platform.dropoff != null) {
							if (this.ship.carrying != null && this.ship.carrying === this.ship.platform.dropoff) {
								this.msg = {
									title: "Well done",
									summary: ["The package has been delivered"],
								};
								return this.endLevel();
							}

							this.state = LANDED;

							this.msg = {
								title: "Oops!",
								summary: ["You were supposed to deliver a package"],
							};
							this.ship.platform = null;
							this.ship.state = this.ship.TAKINGOFF;
							return setTimeout(() => this.startPlaying(), 2000);
						} else if (this.ship.platform.pickup != null) {
							this.state = LANDED;

							this.world.removePackage();

							this.ship.carrying = this.ship.platform.pickup;
							this.msg = {
								title: "Got it!",
								summary: ["Package picked up...", "Now deliver it!"],
							};

							this.ship.platform = null;
							this.ship.state = this.ship.TAKINGOFF;

							return setTimeout(() => this.startPlaying(), 2000);
						}
					} else {
						this.endLevel();
						return (this.msg = {
							title: "Well done",
							summary: ["You landed safely"],
						});
					}
				}
				break;

			case this.ship.LANDEDTOOFAST:
				this.crashed();
				return (this.msg = {
					title: "Oops!",
					summary: ["You landed too fast and crashed."],
					state: "crashed",
				});

			case this.ship.ORBIT:
				this.crashed();
				return (this.msg = {
					title: "Oops!",
					summary: ["You flew too high.", "You are either in orbit or lost in space"],
					state: "crashed",
				});

			case this.ship.CRASHED:
				console.log("calling crashed!");
				this.crashed();
				return (this.msg = {
					title: "Oops!",
					summary: ["You crashed into the ground."],
					state: "crashed",
				});
		}
	}

	render(msg) {
		if (msg != null) {
			this.msg = msg;
		}
		// console.log(msg);

		// console.log(msg);

		// draw to buffer

		this.world.render();

		// draw land
		this.offscreen.context.drawImage(this.world.canvas, 0, 0);

		// draw ship
		this.offscreen.context.drawImage(this.ship.canvas, this.ship.x - this.ship.w / 2, this.ship.y - this.ship.h); // ship's position is bottom centre of ship.

		// translate method. allows for ship rotation.
		// @offscreen.context.save()
		// @offscreen.context.translate(@ship.x - @ship.w / 2, @ship.y - @ship.h)
		// @offscreen.context.rotate(@ship.vx * 0.1)
		// @offscreen.context.drawImage(@ship.canvas, 0, 0)
		// @offscreen.context.restore()

		this.offscreen.context.fillStyle = "rgba(5,50,80,0.7)";
		// draw blasters
		if (this.ship.blasters.up) {
			this.offscreen.context.fillRect(this.ship.x - 10 - 2, this.ship.y + 1, 4, this.num(1, 10)); // left bottom blaster
			this.offscreen.context.fillRect(this.ship.x + 0 - 2, this.ship.y + 1, 4, this.num(1, 10)); // right bottom blaster
			this.offscreen.context.fillRect(this.ship.x + 10 - 2, this.ship.y + 1, 4, this.num(1, 10)); // right bottom blaster
		}
		if (this.ship.blasters.right) {
			this.offscreen.context.fillRect(this.ship.x - this.ship.w / 2 + 15, this.ship.y - 10, -this.num(1, 10), 3); // left blaster ... moving right
		}
		if (this.ship.blasters.left) {
			this.offscreen.context.fillRect(this.ship.x + this.ship.w / 2 - 15, this.ship.y - 10, this.num(1, 10), 3); // right blaster ... moving left
		}

		// draw mini

		// draw buffer to stage
		this.stage.context.save();
		// @stage.context.translate(-@ship.x * 2 + @world.w * 0.5, -@ship.y * 2 + @world.h * 0.5)
		this.stage.context.translate(-this.ship.x / 2, -this.ship.y / 2);
		this.stage.context.drawImage(this.offscreen.canvas, 0, 0);
		this.stage.context.restore();

		const mini = 0.07875; // 63/800 ... whch is 65 pixels - 2 for border

		// draw mini view to stage

		const miniX = 10;
		const miniW = mini * this.world.w;
		const miniH = mini * this.world.h;
		const miniY = this.stage.h - miniH - 11;

		this.stage.context.fillStyle = "rgba(0,0,0,0.7)";
		this.stage.context.fillRect(miniX - 1, miniY - 1, miniW + 2, miniH + 2);

		this.stage.context.drawImage(this.offscreen.canvas, 0, 0, this.offscreen.canvas.width, this.offscreen.canvas.height, miniX, miniY, miniW, miniH);

		this.stage.context.save();
		this.stage.context.translate(miniX, miniY);
		this.stage.context.scale(mini, mini);

		// draw mini ship - icon is too small!
		if (this.ship.y > 0) {
			this.stage.drawCircle(this.stage.context, this.ship.x, this.ship.y, this.miniRadius, "rgba(0,60,130,0.2)", 10, "rgba(0,60,130,1)");
		} else {
			this.stage.context.beginPath();
			this.stage.context.moveTo(this.ship.x, 0);
			this.stage.context.lineTo(this.ship.x + this.miniRadius, 50 + this.miniRadius);
			this.stage.context.lineTo(this.ship.x - this.miniRadius, 50 + this.miniRadius);
			this.stage.context.closePath();
			this.stage.context.fillStyle = "red";
			this.stage.context.fill();
		}

		// try and highlight the next platform to land on
		let target = this.level.platforms[0];
		if (this.level.platforms.length > 1) {
			for (const platform of Array.from(this.level.platforms)) {
				if (this.ship.carrying != null && platform.dropoff != null && platform.dropoff === this.ship.carrying) {
					target = platform;
					break;
				} else if (platform.pickup != null) {
					target = platform;
					break;
				}
			}
		}

		const doRender = this.state === PLAYING;

		this.stage.drawCircle(
			this.stage.context,
			target.x * this.world.w + target.w / 2,
			this.world.h - target.y,
			this.miniRadius,
			"rgba(60,250,160,0.2)",
			10,
			"rgba(60,250,160,1)"
		);
		if (doRender) {
			this.miniRadius += 3;
			this.miniRadius %= 100;
		} else {
			this.miniRadius = 0;
		}

		this.stage.context.restore();
		this.renderHUD(doRender, this.msg);
	}

	renderHUD(doRender, msg) {
		// console.log("renderHud", doRender, msg);
		this.hud.render(doRender, this.ship, this.level, msg);
		this.stage.context.drawImage(this.hud.canvas, 0, 0);
	}

	resetShoe() {
		return {
			x: this.stage.w / 2,
			y: this.stage.h + 20,
			r: 0,
			vx: (Math.random() - 0.5) * 20,
			vy: Math.random() * -20 - 5,
			vr: Math.random() - 0.5,
		};
	}

	spawnShoe() {
		const shoe = this.resetShoe();
		// console.log(shoe)
		return this.shoes.push(shoe);
	}

	explodeShoes() {
		// console.log("explodeShoes!")

		if (this.shoes.length < 20 && Math.random() > 0.4) {
			this.spawnShoe();
		}

		return (() => {
			const result = [];
			for (let i = 0; i < this.shoes.length; i++) {
				const s = this.shoes[i];
				s.vy += 0.2; // gravity
				s.x += s.vx;
				s.y += s.vy;
				s.r += s.vr;

				if (s.x < -100 || s.x > this.stage.w + 100 || s.y < -100 || s.y > this.stage.h + 100) {
					this.shoes[i] = this.resetShoe();
				}

				this.stage.context.save();
				this.stage.context.translate(s.x, s.y);
				this.stage.context.rotate(s.r);
				this.stage.context.translate(-50, -25);
				this.stage.context.drawImage(this.ship.canvas, 0, 0);
				// @stage.context.fillStyle = "rgba(100,0,0,0.5)"
				// @stage.context.fillRect(0,0,100,50)
				result.push(this.stage.context.restore());
			}
			return result;
		})();
	}

	num(min, max) {
		return Math.random() * (max - min) + min;
	}
	isKeyDown(code) {
		return this.pressedKeys[code] || false;
	}
}
